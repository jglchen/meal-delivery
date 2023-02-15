import { useState, useEffect, useRef, useContext } from 'react';
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import axios from 'axios';
import store from 'store2';
import {db} from '@/lib/firestore';
import ReactModal from 'react-modal';
import OrderDetail from './orderdetail';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {useWindowSize} from '@react-hook/window-size';
import { UserContext, OrdersContext } from './Context';
import { UserContextType, OrdersContextType, MealOrderType, OrderShopsElm } from '@/lib/types';
import { currOrderStatus, timeDiffPlacedToLast, timeDiffPlacedToCurrent, timeDiffLastToCurrent } from '@/lib/utils';

interface OrderListenType {
   shopId: string;
   id: string;
   userId: string;
   orderstatus: number;
   statushistory: string[];
}

function UserOrders(){
    const userContext: UserContextType = useContext(UserContext);
    const ordersContext: OrdersContextType = useContext(OrdersContext);
    const [mealOrder, setMealOrder] = useState<MealOrderType | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [inPost, setInPost] = useState(false);
    const homeEl = useRef<HTMLDivElement | null>(null);
    const [width] = useWindowSize();

    useEffect(() => {
       const timer = setInterval(() => {
          setCurrentTime(new Date());  
       }, 1000);

       return () => {
         clearInterval(timer);
       }
    },[]);
    
    useEffect(() => {
       if (userContext.isLoggedIn && userContext.user.id && ordersContext.orderlist.length > 0) {
          const q = query(collection(db, "mealdelivery", userContext.user.id, "orderrecent"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
          
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const orderRecents: OrderListenType[] = [];
            querySnapshot.forEach((doc) => {
               orderRecents.push(doc.data() as OrderListenType);
            });
            
            for (let elm of orderRecents){
                const orderList = ordersContext.orderlist.slice();
                const idx = orderList.findIndex(item => item.id === elm.id && item.shopId === elm.shopId);
                if (idx === -1) {
                   return;
                } 
                orderList[idx] = {...orderList[idx], ...elm};

                ordersContext.update(orderList);
                const mealOrders = {logintime: Math.round(new Date().getTime() / 1000), userId: userContext.user.id, orderList: orderList}
                store('currorders', JSON.stringify(mealOrders));
            }
          });
          return () => {
            unsubscribe();
          }
       }
    },[userContext, ordersContext]);
    
    function removeOrder(order: MealOrderType){
       if (!confirm(`Are you sure to cancel this order to ${order.shopName}?`)) {
          return;
       }
       updateOrder(order);
    }

    async function updateOrder(order: MealOrderType){
       const statustobe = order.orderstatus + 1;
       if (statustobe !== 1 && statustobe !== 5){
          return;
       }

       const updateObj = {shopId: order.shopId, id: order.id, statustobe, statushistory: order.statushistory};
       const {encryptStorage} = await import('@/lib/encryptStorage');
       const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
       setInPost(true);
       try {
           const {data} = await axios.put('/api/updateuserorder', updateObj, { headers: headers });
           setInPost(false);
           if (data.no_authorization){
               return;
           }
           
           const {shopId, id, orderstatus, statushistory} = data;
           //Update ordersContext
           const orderList = ordersContext.orderlist.slice();
           const idx = orderList.findIndex(item => item.id === id && item.shopId === shopId);
           if (idx > -1){
              orderList[idx] = {...orderList[idx], orderstatus, statushistory};
           }
           ordersContext.update(orderList);

           //Update store currorders
           const mealOrders = {logintime: Math.round(new Date().getTime() / 1000), userId: userContext.user.id, orderList: orderList}
           store('currorders', JSON.stringify(mealOrders));

           //Update store myordershops 
           if (orderstatus === 1){
              const myOrderShops = JSON.parse(store('myordershops'));
              const currTime = Math.round(new Date().getTime() / 1000);
              if (myOrderShops && myOrderShops.userId === userContext.user.id && currTime < (myOrderShops.logintime + 60 * 10)){
                 const shopList = myOrderShops.shopList;
                 const idx = shopList.findIndex((item: OrderShopsElm) => item.id === shopId);
                 if (idx > -1){
                    const cancel = shopList[idx].cancel;
                    shopList[idx] = {...shopList[idx], cancel: cancel + 1};
                 }
                 store('myordershops', JSON.stringify({ userId: userContext.user.id, logintime: Math.round(new Date().getTime() / 1000), shopList}));
              }else{
                 store.remove('myordershops');
              }  
           }
       }catch(e){
           setInPost(false);
       }
    }
    
    function closeModal(){
      setShowModal(false);
    }

    ReactModal.setAppElement(homeEl.current!);
    
    return ((userContext && ordersContext) &&
        <div className={loaderStyles.container} ref={homeEl}>
        {ordersContext.orderlist.length > 0 &&
          <>
          <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>My Personal Orders:</div>
          <hr />
          </> 
        }
        {ordersContext.orderlist.map((item: MealOrderType) =>
          <div key={item.id} className={deliveryStyle.item}>
            <div className={deliveryStyle.userorder_list}>
              <div style={{fontWeight: 'bold', fontSize: '1.1rem', padding: '0.6rem 0'}}>Restaurant: {item.shopName}</div>
              {width >= 800 &&
               <>
               <button className="muted-button button button-isolated" onClick={() => {setMealOrder(item); setShowModal(true);}}>${(item.sum + item.tax).toFixed(2)} Order Details</button>
               {item.orderstatus === 0 &&
                  <button className="accent-button button button-isolated" onClick={() => removeOrder(item)}>Cancel</button>
               }
               {item.orderstatus === 4 &&
                  <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Confirm Receipt</button>
               }
               </>
              } 
              {width < 800 &&
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <button className="muted-button button button-isolated" onClick={() => {setMealOrder(item); setShowModal(true);}}>${(item.sum + item.tax).toFixed(2)} Order Details</button>
                  {item.orderstatus === 0 &&
                     <button className="accent-button button button-isolated" onClick={() => removeOrder(item)}>Cancel</button>
                  }
                  {item.orderstatus === 4 &&
                     <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Confirm Receipt</button>
                  }
               </div>
              }
            </div>
            <div>
               <meter min="0" value={item.orderstatus} max="5" style={{width: '100%', height: '1rem'}}></meter>
            </div>
            <div className={deliveryStyle.userorder_list}>
              {(item.orderstatus === 1 || item.orderstatus === 5) &&
                 <>
                    <div>Placed@{(new Date(item.created!)).toLocaleTimeString('en-US')}&nbsp;&nbsp;&nbsp;Elapsed: {timeDiffPlacedToLast(item)}</div> 
                    <div>
                    {item.orderstatus === 1 &&
                       <span style={{color: 'red'}}>{currOrderStatus(item)}</span>
                    }  
                    {item.orderstatus !== 1 &&
                      <span>{currOrderStatus(item)}</span>
                    }  
                    </div> 
                 </>
              }
              {(item.orderstatus !== 1 && item.orderstatus !== 5) &&
                <>
                    <div>Placed@{(new Date(item.created!)).toLocaleTimeString('en-US')}&nbsp;&nbsp;&nbsp;Elapsed: {timeDiffPlacedToCurrent(item, currentTime)}</div> 
                    {item.orderstatus !== 0 &&
                    <div>{currOrderStatus(item)}&nbsp;&nbsp;&nbsp;Elapsed: {timeDiffLastToCurrent(item, currentTime)}</div>
                    }
                </>
              }
            </div>
            <hr />  
          </div>
          
        )}    
          <ReactModal 
            isOpen={showModal}
            contentLabel="onRequestClose Modal"
            onRequestClose={() => setShowModal(false)}
            className={deliveryStyle.Modal}
            overlayClassName={lightBoxStyles.lightbox}
          >
            <OrderDetail
               userCategory="user"
               mealOrder={mealOrder!}
               closeModal={closeModal}
            />
         </ReactModal>
         {inPost &&
              <div className={loaderStyles.loadermodal}>
                <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
              </div>
          }
        </div>    
    );
}

export default UserOrders;
