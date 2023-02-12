import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import store from 'store2';
import {UserContext} from '@/components/Context';
import ReactModal from 'react-modal';
import 'material-icons/iconfont/material-icons.css';
import ShopAdd from './shopadd';
import ShopDataManage from './shopdatamanage';
import loaderStyles from '@/styles/loader.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import { UserContextType, ShopBrief } from '@/lib/types';

interface PropsType {
    closeShopManage: () => void;
}

function ShopManage(props: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [shopId, setShopId] = useState('');
    const [manageContent, setmanageContent] = useState('meal');
    const [blockusers, setBlockusers] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const homeEl = useRef<HTMLDivElement | null>(null);
    const [inPost, setInPost] = useState(false);
    
    useEffect(() => {
       if (userContext && userContext.user.shopid && userContext.user.shopid.length > 0) {
          const shopIdArr = userContext.user.shopid.filter(itm => itm.onboard === true);
          if (shopIdArr.length > 0){
            setShopId(shopIdArr[0].id);
          }
       }
    },[userContext]);
    
    function updateBlockUsers(users: string[]){
      setBlockusers(users);
    }

    async function deleteShop(shop: ShopBrief){
      if (!confirm(`Are you sure to delete the restaurant of ${shop.shopname}?`)){
         return;
      }

      initInPost();
      try {
        // Send request to our api route
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        const { data } = await axios.delete('/api/removeshop', { headers: headers, data: {shopId: shop.id}});
        stopInPost();
        let {shopid} = userContext.user;
        shopid = shopid!.filter(item => item.id !== shop.id);
        const user = {...userContext.user, shopid};
        userContext.user = user;
        store('user', JSON.stringify(user));
      }catch(err){
        stopInPost();
      }
    }
    
    function initInPost(){
        setInPost(true);
    }
    
    function stopInPost(){
        setInPost(false);
    }
    
    function closeModal(){
        setShowModal(false);
    }
    
    function closeCallBack(){
        if (props.closeShopManage){
           props.closeShopManage();
        }
    }
    
    ReactModal.setAppElement(homeEl.current!);
    
    return (userContext &&
        <div className={loaderStyles.container} ref={homeEl}>
           {userContext.user.usertype === 2 &&
           <>
           <div className={lightBoxStyles.heading}>
               Manage My Restaurants
           </div>
           <div style={{display: 'flex', justifyContent: 'flex-end'}}>
             {(userContext.user.shopid && userContext.user.shopid.length > 0 && userContext.user.shopid.filter(itm => itm.onboard === true).length > 0) &&
             <>
             {manageContent === 'meal' &&
             <>
              <button className="muted-button button" style={{backgroundColor: 'lightyellow'}}>Manage Meals</button>
              <button className="muted-button button" onClick={() => {setmanageContent('order');}}>Manage Orders</button>
              {blockusers.length > 0 &&
                <button className="muted-button button" onClick={() => {setmanageContent('blockusers');}}>Blocked Users</button>
              }
             </>
             }
             {manageContent === 'order' &&
             <>
              <button className="muted-button button" onClick={() => {setmanageContent('meal');}}>Manage Meals</button>
              <button className="muted-button button" style={{backgroundColor: 'lightyellow'}}>Manage Orders</button>
              {blockusers.length > 0 &&
                <button className="muted-button button" onClick={() => {setmanageContent('blockusers');}}>Blocked Users</button>
              }
             </>
             }
             {manageContent === 'blockusers' &&
             <>
              <button className="muted-button button" onClick={() => {setmanageContent('meal');}}>Manage Meals</button>
              <button className="muted-button button" onClick={() => {setmanageContent('order');}}>Manage Orders</button>
              <button className="muted-button button" style={{backgroundColor: 'lightyellow'}}>Blocked Users</button>
             </>
             }
             </>
             }
             <button className="muted-button button" onClick={() => {setShowModal(true);}}>Add Restaurant</button>
             <button className="muted-button button" style={{marginRight: '0.5rem'}} onClick={closeCallBack}>Close</button>
           </div>
           <div>
           {(userContext.user.shopid && userContext.user.shopid.length > 0 && userContext.user.shopid.filter(itm => itm.onboard === true).length > 0) &&
             <> 
             <label htmlFor="shopIDSelect">My Restaurants</label>
             <select value={shopId} id="shopIDSelect" onChange={(e) => setShopId(e.currentTarget.value)}>
             {userContext.user.shopid.filter(itm => itm.onboard === true)
              .map(itm => <option key={itm.id} value={itm.id}>{itm.shopname}</option>)
             }   
             </select>
             </> 
           }
           {(!userContext.user.shopid || userContext.user.shopid.length === 0 || userContext.user.shopid.filter(itm => itm.onboard === true).length === 0) &&
            <h5>Currently No Restaurant Under My Management</h5>
           }
           {(userContext.user.shopid && userContext.user.shopid.length > 0 && userContext.user.shopid.filter(itm => itm.onboard === false).length > 0) &&
            <>
            <div>Restaurants Awaiting Admin&apos;s Approval:</div>
            {userContext.user.shopid.filter(itm => itm.onboard === false).map(item => 
                <div className={deliveryStyle.item} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}} key={item.id}>
                   <div>{item.shopname}</div><button style={{marginLeft: '20px'}} className="accent-button button" onClick={() => deleteShop(item)}>Delete This Restaurant</button>
                </div>
            )}
            </>
           }
           </div>
           {shopId &&
              <ShopDataManage 
                  shopId={shopId} 
                  manageContent={manageContent}
                  updateBlockUsers={updateBlockUsers}
                  initInPost={initInPost}
                  stopInPost={stopInPost}
                  />
           }
           <ReactModal 
            isOpen={showModal}
            contentLabel="onRequestClose Modal"
            onRequestClose={() => setShowModal(false)}
            className={deliveryStyle.Modal}
            overlayClassName={lightBoxStyles.lightbox}
           >
            <ShopAdd 
               closeModal={closeModal}/> 
           </ReactModal>
           </>
           }
           {inPost &&
              <div className={loaderStyles.loadermodal}>
                <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
              </div>
           }
           <style jsx>{`
           .button {
             margin-right: 0rem;
             margin-left: 0.5rem;
           }
          `}</style>
        </div>
    );

}

export default ShopManage;    