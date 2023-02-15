import { useState, useEffect, useRef, useContext } from 'react';
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import axios from 'axios';
import {db} from '@/lib/firestore';
import ReactModal from 'react-modal';
import OrderDetail from './orderdetail';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {useWindowSize} from '@react-hook/window-size';
import { UserContext } from './Context';
import { UserContextType, MealOrderType } from '@/lib/types';
import { currOrderStatus, timeDiffPlacedToLast, timeDiffPlacedToCurrent, timeDiffLastToCurrent } from '@/lib/utils';

interface PropsType {
    shopId: string;
    initInPost: () => void;
    stopInPost: () => void;
}

function OrderManage({shopId, initInPost, stopInPost}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [mealOrders, setMealOrders] = useState< MealOrderType[]>([]);
    const [mealOrder, setMealOrder] = useState<MealOrderType | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
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
       async function fetchData() {
         const {encryptStorage} = await import('@/lib/encryptStorage');
         const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
         const { data } = await axios.get('/api/getshoporders', { params: { shopId }, headers: headers });
         setMealOrders(data);
       }

       if (userContext && userContext.user.usertype === 2){
          fetchData();
       }
    },[userContext, shopId]);

    useEffect(() => {
      
      if (userContext && userContext.user.usertype === 2 && shopId){
         const q = query(collection(db, "restaurants", shopId, "orderrecent"), where("publiccode", "==", process.env.NEXT_PUBLIC_PUBLIC_CODE));
         const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const orderRecents: MealOrderType[] = [];
            querySnapshot.forEach((doc) => {
              orderRecents.push(doc.data() as MealOrderType);
            });

            for (let elm of orderRecents){
              setMealOrders((prevState: MealOrderType[]) => {
                let currState = prevState.slice();
                const idx = currState.findIndex(item => item.id === elm.id);
                if (idx > -1){
                   currState[idx] = {...currState[idx], ...elm};
                }else{
                   if (elm.orderstatus !== 1 && elm.orderstatus !== 5){
                    currState = [elm, ...currState];
                   }
                }
                return currState;
              });
            }

         });
         return () => {
          unsubscribe();
         }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[userContext, shopId]);

    async function updateOrder(order: MealOrderType){
      let statustobe = 0;
      if (order.orderstatus === 0){
         statustobe = 2;
      }else{
        statustobe = order.orderstatus + 1;
      }
      if (statustobe !== 2 && statustobe !== 3 && statustobe !== 4){
         return;
      }
      const updateObj = {shopId: shopId, id: order.id, userId: order.userId, statustobe, statushistory: order.statushistory};

      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      initInPost();

      try {
          const {data} = await axios.put('/api/updateshoporder', updateObj, { headers: headers });
          stopInPost();
          if (data.no_authorization){
              return;
          }
          const orderList = mealOrders.slice();
          const idx = orderList.findIndex(item => item.id === data.id && shopId === data.shopId);
          if (idx > -1){
             orderList[idx] = {...orderList[idx], orderstatus: data.orderstatus, statushistory: data.statushistory};
          }
          setMealOrders(orderList);
      }catch(e){
          stopInPost();
      }
    }
    
    function closeModal(){
        setShowModal(false);
    }

    return (userContext &&
        <div className={loaderStyles.container} ref={homeEl}>
        {mealOrders.length === 0 &&
           <h5>Currently No Orders To Be Handled</h5>
        }
        {mealOrders.map((item: MealOrderType) =>
          <div key={item.id} className={deliveryStyle.item}>
            <div className={deliveryStyle.userorder_list}>
              <div style={{fontWeight: 'bold', fontSize: '1.1rem', padding: '0.6rem 0'}}>Customer: {item.userName}</div>
              {width >= 800 &&
              <>
              <button className="muted-button button button-isolated" onClick={() => {setMealOrder(item); setShowModal(true);}}>${(item.sum + item.tax).toFixed(2)} Order Details</button>
              {item.orderstatus === 0 &&
                <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Start Processing</button>
              }
              {item.orderstatus === 2 &&
                <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Make In Route</button>
              }
              {item.orderstatus === 3 &&
                <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Meal Delivered</button>
              }
              </>
              } 
              {width < 800 &&
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <button className="muted-button button button-isolated" onClick={() => {setMealOrder(item); setShowModal(true);}}>${(item.sum + item.tax).toFixed(2)} Order Details</button>
                {item.orderstatus === 0 &&
                  <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Start Processing</button>
                }
                {item.orderstatus === 2 &&
                  <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Make In Route</button>
                }
                {item.orderstatus === 3 &&
                  <button className="accent-button button button-isolated" onClick={() => updateOrder(item)}>Meal Delivered</button>
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
               userCategory="owner"
               mealOrder={mealOrder!}
               closeModal={closeModal}
            />
         </ReactModal>
        </div>
    );

}  

export default OrderManage;
