import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import store from 'store2';
import ReactModal from 'react-modal';
import Tooltip from '@mui/material/Tooltip';
import DisplayImage from './displayimage';
import OrderDetail from './orderdetail';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import { UserContext } from './Context';
import { UserContextType, ShopDataType, OrderShopsElm, MealOrderType } from '@/lib/types';
import { currOrderStatusLong, pageSizeOrders } from '@/lib/utils';

interface PropsType {
   closeOrderRecords: () => void;
   shopId?: string;
}

function UserOrderRecords(props: PropsType){
   const userContext: UserContextType = useContext(UserContext);
   const [shopId, setShopId] = useState(`${props.shopId ? props.shopId: ''}`);
   const [shopListData, setShopListData] = useState<ShopDataType[]>([]);
   const [orderShops, setOrderShops] = useState<OrderShopsElm[]>([]);
   const [orderByStr, setOrderByStr] = useState('count');
   const [userOrders, setUserOrders] = useState< MealOrderType[]>([]);
   const [orderCount, setOrderCount] = useState(0);
   const [pageIndex, setPageIndex] = useState(0);
   const [mealOrder, setMealOrder] = useState<MealOrderType | null>(null);
   const [showModal, setShowModal] = useState(false);
   const homeEl = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      const { shopListData: shopData } = JSON.parse(store('shopliststore'));
      setShopListData(shopData);
   },[]);
   
   useEffect(() => {
      async function fetchOrdersShops(){
         const {encryptStorage} = await import('@/lib/encryptStorage');
         const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
         try {
            const { data } = await axios.get('/api/getuserordershops', { headers: headers });
            //const { shopListData } = JSON.parse(store('shopliststore'));
            
            const shopList = data.map((item: OrderShopsElm) => {
                const elm = shopListData.find((itm: ShopDataType) => itm.id === item.id);
                if (!elm){
                   return item;
                }
                return {...item, shopname: elm.shopname, profileimage: elm.profileimage};
            });
            const myOrderShops = { userId: userContext.user.id, logintime: Math.round(new Date().getTime() / 1000), shopList};
            store('myordershops', JSON.stringify(myOrderShops));
            if (orderByStr === 'cancel'){
               setOrderShops(shopList.sort((a: OrderShopsElm, b: OrderShopsElm) => {
                  if (a.cancel > b.cancel){
                     return -1;
                  }else if (a.cancel < b.cancel){
                      return 1;
                  }else{
                      if (a.count > b.count){
                          return 1;
                      }else if (a.count < b.count){
                          return -1;
                      }else{
                          return 0;
                      }
                  }
               }));
            }else{
               setOrderShops(shopList.sort((a: OrderShopsElm, b: OrderShopsElm) => {
                  if (a.count > b.count){
                     return -1;
                  }else if (a.count < b.count){
                      return 1;
                  }else{
                      if (a.cancel > b.cancel){
                          return 1;
                      }else if (a.cancel < b.cancel){
                          return -1;
                      }else{
                          return 0;
                      }
                  }
               }));
            }
         }catch(e){
            //-----
         }
      }
      
      if (userContext && userContext.user.id){
         const myOrderShops = JSON.parse(store('myordershops'));
         const currTime = Math.round(new Date().getTime() / 1000);
         if (myOrderShops && myOrderShops.userId === userContext.user.id && currTime < (myOrderShops.logintime + 60 * 10)){
            const shopList = myOrderShops.shopList;
            if (orderByStr === 'cancel'){
               shopList.sort((a: OrderShopsElm, b: OrderShopsElm) => {
                  if (a.cancel > b.cancel){
                      return -1;
                   }else if (a.cancel < b.cancel){
                       return 1;
                   }else{
                       if (a.count > b.count){
                           return 1;
                       }else if (a.count < b.count){
                           return -1;
                       }else{
                           return 0;
                       }
                   }
              });
            }else{
               shopList.sort((a: OrderShopsElm, b: OrderShopsElm) => {
                  if (a.count > b.count){
                     return -1;
                  }else if (a.count < b.count){
                      return 1;
                  }else{
                      if (a.cancel > b.cancel){
                          return 1;
                      }else if (a.cancel < b.cancel){
                          return -1;
                      }else{
                          return 0;
                      }
                  }
              });
            }
            setOrderShops(shopList);
            return;
         }
         fetchOrdersShops();
      }

   },[userContext, orderByStr, shopListData]);

   useEffect(() => {
      if (userContext && userContext.user.id && shopId){
         setPageIndex(0);
         retrieveUserOrders(shopId, 0);

         const elm = orderShops.find(item => item.id === shopId);
         if (elm){
            setOrderCount(elm.count);
         }else{
            setOrderCount(0);           
         }
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   },[userContext, shopId]);
   
   async function fetchUserOrders(shopid: string, pIndex: number){
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      try {
         const { data } = await axios.get('/api/getuserorderrecords', { params: { shopId: shopid, page: pIndex }, headers: headers });
         setUserOrders(data);
         const myOrderRecords = { userId: userContext.user.id, logintime: Math.round(new Date().getTime() / 1000), orderList: data};
         store(`myorder_${shopid}_${pIndex}`, JSON.stringify(myOrderRecords));
      }catch(e){
         //----
      }
   }

   function retrieveUserOrders(shopid: string, pIndex: number){
      const orderRecords = JSON.parse(store(`myorder_${shopid}_${pIndex}`));
      const currTime = Math.round(new Date().getTime() / 1000);
      if (orderRecords && orderRecords.userId === userContext.user.id && currTime < (orderRecords.logintime + 60 * 10)){
         setUserOrders(orderRecords.orderList);
         return;
      }

      fetchUserOrders(shopid, pIndex);
   }

   function getShopName(id: string){
      const elm =  shopListData.find((item: ShopDataType) => item.id === id);
      if (! elm){
         return '';
      }
      return elm.shopname || '';
   }

   function closeModal(){
      setShowModal(false);
   }

   ReactModal.setAppElement(homeEl.current!);

   return(
      <div className={loaderStyles.container} ref={homeEl}>
         <div className={lightBoxStyles.heading}>
         {!shopId &&
            <>My Purchase Orders Summary</>
         }
         {shopId &&
            <>My Purchase Order Records {getShopName(shopId) && <>{`at ${getShopName(shopId)}`}</>}</>
         }
         </div>
         <div  style={{display: 'flex', justifyContent: 'flex-end'}}>
            {shopId &&
               <button className="muted-button button" onClick={() => setShopId('')}>Back To Summary</button>
            }
            <button className="muted-button button" style={{marginRight: '0.5rem'}} onClick={props.closeOrderRecords}>Close</button>
         </div>
         {userContext &&
         <>
            {shopId &&
            <>
              {userOrders.length >0 &&
               <div><hr /></div>
              }
              {userOrders.map((item: MealOrderType) =>
               <div key={item.id} className={deliveryStyle.item}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Restaurant: {getShopName(shopId)}</div>
                   <div>Placed@{(new Date(item.created!)).toLocaleString()}</div>
                   {item.orderstatus === 1 &&
                     <div style={{color: 'red'}}>{currOrderStatusLong(item)}</div> 
                   }
                   {item.orderstatus !== 1 &&
                     <div>{currOrderStatusLong(item)}</div> 
                   }
                 </div>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{width: '75%'}}><meter min="0" value={item.orderstatus} max="5" style={{width: '100%', height: '3rem'}}></meter></div>
                    <button className="muted-button button" style={{marginRight: '0rem'}} onClick={() => {setMealOrder({...item, shopName: getShopName(shopId)}); setShowModal(true);}}>${(item.sum + item.tax).toFixed(2)} Order Details</button>
                 </div>
                 <hr />  
               </div> 
              )}
              <div>
              {pageIndex > 0 &&                   
                  <button className="muted-button" onClick={() => {const pIndex = pageIndex - 1; setPageIndex(pIndex); retrieveUserOrders(shopId, pIndex);}}>&larr;  Previous</button>
              }
              {orderCount > pageSizeOrders*(pageIndex+1) &&
                  <button className="muted-button" onClick={() => {const pIndex = pageIndex + 1; setPageIndex(pIndex); retrieveUserOrders(shopId, pIndex);}}>Next  &rarr;</button>
              }
              </div>
            </>
            }
            {!shopId &&
            <>
            <table>
               <thead>
                  <tr>
                     <th style={{width: '33%'}}>Restaurants</th>
                     {orderShops.length === 0 &&
                     <>
                     <th style={{width: '33%'}}>Number of Orders</th>
                     <th style={{width: '33%'}}>Number of Cancels</th>
                     </>
                     }
                     {(orderShops.length > 0 && orderByStr === 'count') &&
                     <>
                     <Tooltip title="Ordered by number of orders descendingly" arrow>
                        <th style={{width: '33%'}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Number of Orders<span className="material-icons">south</span></div></th>
                     </Tooltip>
                     <Tooltip title="Ordered by number of cancels descendingly" arrow>
                        <th style={{width: '33%'}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={() => setOrderByStr('cancel')}>Number of Cancels<span className="material-icons" style={{color: 'lightgray'}}>unfold_more</span></div></th>
                     </Tooltip>
                     </>
                     }
                     {(orderShops.length > 0 && orderByStr === 'cancel') &&
                     <>
                     <Tooltip title="Ordered by number of orders descendingly" arrow>
                        <th style={{width: '33%'}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={() => setOrderByStr('count')}>Number of Orders<span className="material-icons" style={{color: 'lightgray'}}>unfold_more</span></div></th>
                     </Tooltip>
                     <Tooltip title="Ordered by number of cancels descendingly" arrow>
                        <th style={{width: '33%'}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Number of Cancels<span className="material-icons">south</span></div></th>
                     </Tooltip>
                     </>
                     }
                  </tr>
               </thead>
               <tbody>
               {orderShops.map((item) =>
                  <tr key={item.id} style={{cursor:'pointer'}} onClick={() => {setShopId(item.id);}}>
                     <td>
                        <div style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                           <DisplayImage src={item.profileimage!} width={48} alt={''} />
                           <div style={{marginLeft: '0.5rem'}}>
                              {item.shopname}
                           </div>
                        </div>
                     </td>
                     <td className="text-center">{item.count}</td>
                     <td className="text-center">{item.cancel}</td>
                  </tr>
               )
               } 
               </tbody>
            </table>
            </>
            }
         </>
         }
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



      </div>
    
   )


}

export default UserOrderRecords;

