import { useState, useEffect, useRef, useContext, Fragment } from 'react';
import axios from 'axios';
import {UserContext} from '@/components/Context';
import ReactModal from 'react-modal';
import 'material-icons/iconfont/material-icons.css';
import {useWindowSize} from '@react-hook/window-size';
import MealAdd from './mealadd';
import MealEdit from './mealedit';
import MealProfileUpdate from './mealprofileupdate';
import ShopEdit from './shopedit';
import ShopProfileUpdate from './shopprofileupdate';
import DisplayImage from './displayimage';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContextType, ShopDataType, MealDataType, ShopBrief} from '@/lib/types';
import { pageSizeMeals } from '@/lib/utils';

interface PropsType {
    shopData: ShopDataType;
    shopMutate: (shop: ShopDataType) => void;
    mealMenu:  MealDataType[];
    updateMenu: (menu?: MealDataType[]) => void;
    pageIndex: number;
    updatePage: (pIndex: number) => void;
    initInPost: () => void;
    stopInPost: () => void;
}

function MealManage({shopData, shopMutate, mealMenu, updateMenu, pageIndex, updatePage, initInPost, stopInPost}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [showModal, setShowModal] = useState(false);
    const [shopEditModal, setShopEditModal] = useState(false);
    const [shopProfileModal, setShopProfileModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showProfileEditModal, setShowProfileEditModal] = useState(false);
    const [mealForEdit, setMealForEdit] = useState<MealDataType | null>(null);
    const [shopDataWidth, setShopDataWidth] = useState('calc(100% - 192px)');
    const homeEl = useRef<HTMLDivElement | null>(null);
    const [width] = useWindowSize();
    const [homeElWidth, setHomeElWidth] = useState(0);

    useEffect(() => {
      if (mealMenu && mealMenu.length > 0){
        setMealForEdit(mealMenu[0]);
      }
    },[mealMenu]); 

    useEffect(() => {
      if (width < 600){
        setShopDataWidth('100%');
        setHomeElWidth((homeEl.current as HTMLDivElement).offsetWidth || (width- 1.5 * 16));
      }
    },[width]);
    
    function updateShopData(shop: ShopDataType){
      shopMutate(shop);
      const user = userContext.user;
      let shopList: ShopBrief[] | undefined = user.shopid?.slice();
      shopList = shopList || [];
      const idx = shopList.findIndex((item: ShopBrief) => item.id === shop.id);
      if (idx > -1){
         shopList[idx] = {id: shop.id, shopname: shop.shopname, onboard: shop.onboard};
      }
      userContext.login({...user, shopid: shopList});
    }
    
    async function deleteMeal(meal: MealDataType){
       if (!confirm(`Are you sure to delete the meal of ${meal.mealname}?`)){
          return;
       }

       initInPost();
       try {
         // Send request to our api route
         const {encryptStorage} = await import('@/lib/encryptStorage');
         const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
         const { data } = await axios.delete('/api/removemeal', { headers: headers, data: {shopId: shopData.id, id: meal.id}});
         stopInPost();
         const menuList = mealMenu.slice().filter((item: MealDataType) => item.id !== meal.id);
         updateMenu(menuList);
       }catch(err){
          stopInPost();
       }
    }
    
    function updateMealMenu(meal: MealDataType){
       if (pageIndex){
          updatePage(0);
          updateMenu();
          return;
       }
       let menuList = mealMenu.slice(0, pageSizeMeals - 1);
       updateMenu([meal, ...menuList]);
    }

    function updateMenuOnMealEdit(meal: MealDataType){
       const menuList = mealMenu.slice();
       const idx = menuList.findIndex((item: MealDataType) => item.id === meal.id);
       if (idx > -1){
          menuList[idx] = meal;
       }
       updateMenu(menuList);
    }
   
    function closeModal(){
      setShowModal(false);
    }
    
    function closeEditModal(){
      setShowEditModal(false);
    }

    function closeProfileEditModal(){
      setShowProfileEditModal(false);
    }

    function closeShopEditModal(){
      setShopEditModal(false);
    }

    function closeShopProfileModal(){
      setShopProfileModal(false);
    }

    return (userContext &&
        <div ref={homeEl}>
           {shopData &&
            <div className={`${deliveryStyle.item} clearfix`} style={{backgroundColor: '#fffff0'}}>
              <div className="float-left">
                {shopDataWidth === '100%' &&
                  <DisplayImage alt="" src={shopData.profileimage} width={homeElWidth} height={192} />
                }
                {shopDataWidth !== '100%' &&
                  <DisplayImage alt="" src={shopData.profileimage} width={192} />
                }
              </div>
              <div className={`${deliveryStyle.flex_container} float-left`} style={{width: shopDataWidth}}>
                <div style={{fontWeight: 'bold'}}>{shopData.shopname}</div>
                <div>
                {shopData.foodsupply.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
                  return (
                    <Fragment key={index}>
                     {itm}<br />
                    </Fragment>
                  )
                })}
                </div>
                {shopDataWidth !== '100%' &&
                <>
                <div>
                  <button className="accent-button button" onClick={() => {setShowModal(true);}}>Add Meals</button>
                </div>  
                <div>   
                  <button className="accent-button button" onClick={() => {setShopEditModal(true);}}>Restaurant Edit</button>
                </div>
                <div>
                  <button className="accent-button button" onClick={() => {setShopProfileModal(true);}}>Restaurant Profile</button>
                </div>
                </>  
                }
                {shopDataWidth === '100%' &&
                <div>
                  <button className="accent-button button" onClick={() => {setShowModal(true);}}>Add Meals</button>
                  <button className="accent-button button" onClick={() => {setShopEditModal(true);}}>Restaurant Edit</button>
                  <button className="accent-button button" onClick={() => {setShopProfileModal(true);}}>Restaurant Profile</button>
                </div>
                }
              </div>
            </div>
           } 
           
           {(mealMenu && mealMenu.length > 0) &&
             <>
              <div className={`${deliveryStyle.item} ${deliveryStyle.flexcontainer}`}>
              {mealMenu.map((item: MealDataType) => 
                <div key={item.id} className="clearfix">
                  <div className="float-left">
                    <DisplayImage  alt="" src={item.profileimage as string} />
                  </div>
                  <div className="float-left" style={{paddingLeft: '0.5rem', width:'calc(100% - 128px)'}}>
                    <div style={{fontWeight: 'bold'}}>{item.mealname}</div>
                    <div>
                    {item.mealdescr.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index:number) =>{
                       return (
                         <Fragment key={index}>
                         {itm}<br />
                         </Fragment>
                      )
                    })}
                    </div>
                    <div>{`$${item.unitprice}`}</div>
                    <div>
                      <button className="button float-left" onClick={() => {setMealForEdit(item); setShowEditModal(true);}}>Edit</button>
                      <button className="button float-left" onClick={() => {setMealForEdit(item); setShowProfileEditModal(true);}}>Profile Update</button>
                      <button className="button float-left" onClick={() => deleteMeal(item)}>Delete</button>
                    </div> 
                    <div>
                    </div> 
                  </div>
                </div>
              )}  
              </div>
              <div>
              {pageIndex > 0 && 
                <button className="muted-button" onClick={() => updatePage(pageIndex - 1)}>&larr;  Previous</button>
              }
              {pageSizeMeals === mealMenu.length &&
                <button className="muted-button" onClick={() => updatePage(pageIndex + 1)}>Next  &rarr;</button>
              }
              </div>
            </>
           }
           {shopData &&
            <>            
            <ReactModal 
              isOpen={showModal}
              contentLabel="onRequestClose Modal"
              onRequestClose={() => setShowModal(false)}
              className={deliveryStyle.Modal}
              overlayClassName={lightBoxStyles.lightbox}
            >
              <MealAdd 
                shopId={shopData.id}
                shopName={shopData.shopname}
                updateMealMenu={updateMealMenu}
                closeModal={closeModal}
              />
            </ReactModal>
            <ReactModal 
              isOpen={shopEditModal}
              contentLabel="onRequestClose Modal"
              onRequestClose={() => setShopEditModal(false)}
              className={deliveryStyle.Modal}
              overlayClassName={lightBoxStyles.lightbox}
            >
              <ShopEdit 
                 shopData={shopData}
                 updateShopData={updateShopData}
                 closeModal={closeShopEditModal}
              />
            </ReactModal>
            <ReactModal 
              isOpen={shopProfileModal}
              contentLabel="onRequestClose Modal"
              onRequestClose={() => setShopProfileModal(false)}
              className={deliveryStyle.Modal}
              overlayClassName={lightBoxStyles.lightbox}
            >
              <ShopProfileUpdate 
                 shopData={shopData}
                 updateShopData={updateShopData}
                 closeModal={closeShopProfileModal}
              />
            </ReactModal>
            </>
           }
           {(mealMenu && mealMenu.length > 0) &&
            <>
            <ReactModal 
              isOpen={showEditModal}
              contentLabel="onRequestClose Modal"
              onRequestClose={() => setShowEditModal(false)}
              className={deliveryStyle.Modal}
              overlayClassName={lightBoxStyles.lightbox}
            >
              <MealEdit
                 shopId={shopData.id}
                 mealData={mealForEdit as MealDataType}
                 updateMenuOnMealEdit={updateMenuOnMealEdit}
                 closeModal={closeEditModal}
              />
            </ReactModal>
            <ReactModal 
              isOpen={showProfileEditModal}
              contentLabel="onRequestClose Modal"
              onRequestClose={() => setShowProfileEditModal(false)}
              className={deliveryStyle.Modal}
              overlayClassName={lightBoxStyles.lightbox}
            >
              <MealProfileUpdate
                 shopId={shopData.id}
                 mealData={mealForEdit as MealDataType}
                 updateMenuOnMealEdit={updateMenuOnMealEdit}
                 closeModal={closeProfileEditModal}
              />
            </ReactModal>
            </> 
           }
           <style jsx>{`
           .button {
            margin-right: 0.5rem;
            margin-left: 0rem;
           }
          `}</style>
        </div>
    );    
}

export default MealManage;    