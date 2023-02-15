import { useState, useEffect, useRef, useContext, Fragment, FormEvent } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import store from 'store2';
import {UserContext} from '@/components/Context';
import ReactModal from 'react-modal';
import 'material-icons/iconfont/material-icons.css';
import {useWindowSize} from '@react-hook/window-size';
import DisplayImage from './displayimage';
import UserOrders from './userorders';
import MealOrder from './mealorder';
import UserOrderRecords from './userorderrecords';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContextType, ShopDataType, MealDataType, MealOrderElm, OrderShopsElm} from '@/lib/types';

interface PropsType {
    menuData : {
      shopData: ShopDataType | null;
      mealList: MealDataType[];
    }
}

function MenuDisplay({menuData}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [blockedUser, setBlockedUser] = useState(false);
    const [mealArr, setMealArr] = useState<MealOrderElm[]>([]);
    const [orderShops, setOrderShops] = useState<OrderShopsElm[]>([]);
    const [orderRecords, setOrderRecords] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [shopDataWidth, setShopDataWidth] = useState('calc(100% - 192px)');
    const homeEl = useRef<HTMLDivElement | null>(null);
    const itemsRef = useRef<HTMLInputElement[]>([]);
    const router = useRouter();
    const [width] = useWindowSize();
    const [homeElWidth, setHomeElWidth] = useState(0);

    useEffect(() => {
      if (width < 600){
        setShopDataWidth('100%');
        setHomeElWidth((homeEl.current as HTMLDivElement).offsetWidth || (width- 2* 16));
      }
    },[width]);
    
    useEffect(() => {
      if (menuData.mealList && menuData.mealList.length > 0){
         const mealList = menuData.mealList.map(item =>  {
           const elm =  {id: item.id, mealname: item.mealname, unitprice: item.unitprice};
           return elm;
         });
         setMealArr(mealList);
      }
    },[menuData]);

    useEffect(() => {
      if (menuData.shopData &&  menuData.shopData.blockusers && menuData.shopData.blockusers.includes(userContext.user.id as string)){
         setBlockedUser(true);
      }
    },[menuData, userContext]);

    useEffect(() => {
      async function fetchOrdersShops(){
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        try {
           const { data } = await axios.get('/api/getuserordershops', { headers: headers });
           const { shopListData } = JSON.parse(store('shopliststore'));
           
           const shopList = data.map((item: OrderShopsElm) => {
               const elm = shopListData.find((itm: ShopDataType) => itm.id === item.id);
               if (!elm){
                  return item;
               }
               return {...item, shopname: elm.shopname, profileimage: elm.profileimage};
           });
           const myOrderShops = { userId: userContext.user.id, logintime: Math.round(new Date().getTime() / 1000), shopList};
           store('myordershops', JSON.stringify(myOrderShops));
           setOrderShops(shopList);
        }catch(e){
           //-----
        }
      }
    
      if (userContext && userContext.user.id){
         const myOrderShops = JSON.parse(store('myordershops'));
         const currTime = Math.round(new Date().getTime() / 1000);
         if (myOrderShops && myOrderShops.userId === userContext.user.id){
            setOrderShops(myOrderShops.shopList);
            return;
         }
         fetchOrdersShops();
      }
    },[userContext]);

    function changeOrderStatus(e: FormEvent, idx: number){
       if (itemsRef.current[idx]?.contains(e.target as Element)){
          return;
       }
       
       const mealList =  mealArr.slice();
       if (mealList[idx].quantity) {
           delete mealList[idx].quantity;
       }else{
           mealList[idx] = {...mealList[idx], quantity: 1}; 
       }
       setMealArr(mealList);
    }

    function changeOrderQty(e: FormEvent, idx: number){
      const quantity = Number((e.target as HTMLInputElement).value);
      if (quantity < 1){
         return;
      }
      const mealList =  mealArr.slice();
      mealList[idx] = {...mealList[idx], quantity};
      setMealArr(mealList);
    }

    function updateMealOrderArr(orderList:MealOrderElm[]){
      const mealList =  mealArr.slice();
      for (let elm of orderList){
        const idx = mealList.findIndex(item => item.id === elm.id);
        if (idx > -1) {
          mealList[idx] = {...mealList[idx], quantity: elm.quantity};
        }
      }
      setMealArr(mealList);
    }

    function resetOrder(){
      const mealList =  mealArr.map(item => {
        if (item.quantity){
           delete item.quantity;
        }
        return item;
      })
      setMealArr(mealList);
    }

    function closeOrderRecords(){
      setOrderRecords(false);
    }

    function closeModal(){
      setShowModal(false);
    }
    
    ReactModal.setAppElement(homeEl.current!);

    return (userContext &&
      <div ref={homeEl}>
        {!userContext.isLoggedIn &&
          <h3 style={{color: 'red'}}>Please log in first to place orders.</h3>
        }
        <div className={`${deliveryStyle.item} clearfix`}>
          <UserOrders />
        </div>
        {(menuData.shopData && !blockedUser) &&
        <div className={`${deliveryStyle.item} clearfix`} style={{backgroundColor: '#fffff0'}}>
          <div className="float-left">
            {shopDataWidth === '100%' &&
              <DisplayImage alt="" src={menuData.shopData.profileimage} width={homeElWidth} height={192} />
            }
            {shopDataWidth !== '100%' &&
              <DisplayImage alt="" src={menuData.shopData.profileimage} width={192} />
            }
          </div>
          <div className={`${deliveryStyle.flex_container} float-left`} style={{width: shopDataWidth}}>
            <div style={{fontWeight: 'bold'}}>{menuData.shopData.shopname}</div>
            <div>
            {menuData.shopData.foodsupply.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
              return (
                <Fragment key={index}>
                  {itm}<br />
                </Fragment>
              )
            })}
            </div>
            <div><button className="accent-button button" onClick={() => router.push({pathname: '/', query: { asuser: 'Y' },})}>&larr; Back To Select Restaurants</button></div>
            <div>
            {(userContext.isLoggedIn && mealArr.find(item => item.quantity) && !blockedUser) &&
              <>
               <button className="accent-button button" onClick={() => setShowModal(true)}>Place Order</button>
               <button className="accent-button button" onClick={() => resetOrder()}>Reset</button>
              </>
            }
            </div>
            <div>
            {(userContext.isLoggedIn && orderShops.find((item: OrderShopsElm) => item.id ===  menuData.shopData?.id)) &&
               <button className="muted-button button" onClick={() => setOrderRecords(true)}>My Purchase Order Records</button> 
            }
            </div>  
          </div>
        </div> 
        }

        {(menuData.mealList && menuData.mealList.length > 0 && !blockedUser) &&
        <div className={`${deliveryStyle.item} ${deliveryStyle.flexcontainer}`}>
          {menuData.mealList.map((item: MealDataType, idx: number) => 
            <div key={item.id} className="clearfix" onClick={(e) => changeOrderStatus(e, idx)} style={{cursor: 'pointer'}}>
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
                  {mealArr[idx] &&
                  <>
                  {mealArr[idx].quantity &&
                   <>
                   <div className="float-left"><span className="material-icons">check_box</span></div>Order Qty<input type="number" min="1" value={mealArr[idx].quantity} className={deliveryStyle.qty_keyin}  onChange={(e) => changeOrderQty(e, idx)} ref={(el: HTMLInputElement) => itemsRef.current[idx]=el} />
                   </>
                  }
                  {!mealArr[idx].quantity &&
                   <>
                   <div className="float-left"><span className="material-icons">check_box_outline_blank</span></div>Order This Meal
                   </>
                  }
                  </> 
                  }
               </div>
              </div>
            </div>    
          )} 
        </div>
        }
        {orderRecords &&
         <div className={lightBoxStyles.lightbox}>
            <div className={lightBoxStyles.module}>
               <div className="container">
                  <UserOrderRecords
                    shopId={menuData.shopData?.id} 
                    closeOrderRecords={closeOrderRecords} 
                    />
               </div>
            </div>
         </div> 
        }
        <ReactModal 
          isOpen={showModal}
          contentLabel="onRequestClose Modal"
          onRequestClose={() => setShowModal(false)}
          className={deliveryStyle.Modal}
          overlayClassName={lightBoxStyles.lightbox}
        >
          <MealOrder 
             shopData={menuData.shopData as ShopDataType}
             mealArr={mealArr}
             updateMealOrderArr={updateMealOrderArr}
             resetOrder={resetOrder}
             closeModal={closeModal}
          />
        </ReactModal>
      </div>
    )
}

export default MenuDisplay;    


 