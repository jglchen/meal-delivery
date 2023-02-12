import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {UserContext} from '@/components/Context';
import ReactModal from 'react-modal';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import OrderDetail from './orderdetail';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContextType, ShopDataType, ShopClientsElm, MealOrderType, MealDataType, ShopBrief} from '@/lib/types';
import { currOrderStatusLong, pageSizeOrders, pageSizeClients } from '@/lib/utils';

interface PropsType {
    shopData: ShopDataType;
    shopMutate: (shop: ShopDataType) => void;
    blockClients: ShopClientsElm[];
    updateBlockedClients: (blockClients: ShopClientsElm[]) => void;
    initInPost: () => void;
    stopInPost: () => void;
}

function BlockedUsers({shopData, shopMutate, blockClients, updateBlockedClients, initInPost, stopInPost}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [orderByStr, setOrderByStr] = useState('count');
    const [userElm, setUserElm] = useState<ShopClientsElm | null>(null);
    const [clientOrders, setClientOrders] = useState< MealOrderType[]>([]);
    const [pageIndexBlocks, setPageIndexBlocks] = useState(0);
    const [pageIndexOrders, setPageIndexOrders] = useState(0);
    const [mealOrder, setMealOrder] = useState<MealOrderType | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    function compare(a: ShopClientsElm, b: ShopClientsElm) {
        if (orderByStr === 'cancel'){
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
        }else{
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
        }    
    }

    async function fetchClientOrders(userId: string, pIndex: number){
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        try {
           const { data } = await axios.get('/api/getclientorderrecords', { params: { shopId: shopData.id, userId, page: pIndex }, headers: headers });
           setClientOrders(data);
        }catch(e){
           //----
        }
    }

    useEffect(() => {
        if (userContext && userContext.user.id && userElm){
            setPageIndexOrders(0);
            fetchClientOrders(userElm.id, 0);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[userContext, userElm]);

    function closeModal(){
        setShowModal(false);
    }

    async function unblockShopUser(userElm: ShopClientsElm){
        initInPost();
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        try {
          // Send request to our api route
          const { data } = await axios.put('/api/unblockshopuser', {shopId: shopData.id, userId: userElm.id}, { headers: headers });
          stopInPost();
          if (!data.shop_unblockusers){
             return;
          }
          const blockUsers = blockClients.slice().filter(item => item.id !== userElm.id);
          updateBlockedClients(blockUsers);
          setUserElm(null);
          const shopDataObj = {...shopData, blockusers: blockUsers.map(item => item.id)};
          shopMutate(shopDataObj);
        }catch(err){
          stopInPost();      
        }
    }
    
    return(userContext &&
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {!userElm &&
               <>
               <div></div>
               <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>Blocked User List</div>
               <div></div>
               </>
            }
            {userElm &&
               <>
               <button className="muted-button button" onClick={() => setUserElm(null)}>Back To Blocked User List</button>
               <div style={{fontSize: '1.4rem', fontWeight: 'bold'}}>{`${userElm.userName}'s Purchase Records`}</div>
               <Tooltip title="This client has been blocked" arrow>
                    <button className="accent-button button" style={{marginRight: '0rem'}} onClick={() => unblockShopUser(userElm)}>Unblock This Client</button>
               </Tooltip>
               </>
            }
            </div>
            {userElm &&
            <>
              {clientOrders.length >0 &&
               <div><hr /></div>
              }
              {clientOrders.map((item: MealOrderType) => 
              <div key={item.id} className={deliveryStyle.item}>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>Client: {userElm.userName}</div>
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
                  <button className="muted-button button" style={{marginRight: '0rem'}} onClick={() => {setMealOrder(item); setShowModal(true);}}>${(item.sum + item.tax).toFixed(2)} Order Details</button>
               </div>
               <hr />  
              </div> 
              )}

              <div>
              {pageIndexOrders > 0 &&                   
                  <button className="muted-button" onClick={() => {const pIndex = pageIndexOrders - 1; setPageIndexOrders(pIndex); fetchClientOrders(userElm.id, pIndex);}}>&larr;  Previous</button>
              }
              {userElm.count > pageSizeOrders*(pageIndexOrders+1) &&
                  <button className="muted-button" onClick={() => {const pIndex = pageIndexOrders + 1; setPageIndexOrders(pIndex); fetchClientOrders(userElm.id, pIndex);}}>Next  &rarr;</button>
              }
              </div>
            </>
            }
            {!userElm &&
            <>
            <table>
               <thead>
                  <tr>
                     <th style={{width: '33%'}}>Clients</th>
                     {orderByStr === 'count' &&
                     <>
                     <Tooltip title="Ordered by number of orders descendingly" arrow>
                        <th style={{width: '33%'}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Number of Orders<span className="material-icons">south</span></div></th>
                     </Tooltip>
                     <Tooltip title="Ordered by number of cancels descendingly" arrow>
                        <th style={{width: '33%'}}><div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={() => setOrderByStr('cancel')}>Number of Cancels<span className="material-icons" style={{color: 'lightgray'}}>unfold_more</span></div></th>
                     </Tooltip>
                     </>
                     }
                     {orderByStr === 'cancel' &&
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
               {blockClients.slice(pageIndexBlocks*pageSizeClients, (pageIndexBlocks+1)*pageSizeClients).sort(compare).map((item) => 
                  <tr key={item.id} style={{cursor:'pointer'}} onClick={() => {setUserElm(item);}}>
                    <td>{item.userName}</td>
                    <td className='text-center'>{item.count}</td>
                    <td className='text-center'>{item.cancel}</td>
                  </tr> 
               )
               }
               </tbody>
            </table>
            <div>
              {pageIndexBlocks > 0 &&                 
                  <button className="muted-button" onClick={() => setPageIndexBlocks(prevState => prevState-1)}>&larr;  Previous</button>
              }    
              {blockClients.length > pageSizeClients*(pageIndexBlocks+1) &&
                  <button className="muted-button" onClick={() => setPageIndexBlocks(prevState => prevState+1)}>Next  &rarr;</button>
              }
            </div>
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
                userCategory="owner"
                mealOrder={mealOrder!}
                closeModal={closeModal}
              />
            </ReactModal>
        </div> 
    );
}

export default BlockedUsers;        