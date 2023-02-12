import { useState, useEffect, useRef, useContext, FormEvent } from 'react';
import axios from 'axios';
import store from 'store2';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import { UserContext, OrdersContext } from './Context';
import { UserContextType, OrdersContextType, ShopDataType, MealOrderElm, OrderShopsElm} from '@/lib/types';
import { taxRate } from '@/lib/utils';

interface PropsType {
    shopData: ShopDataType;
    mealArr: MealOrderElm[];
    updateMealOrderArr: (orderList:MealOrderElm[]) => void;
    resetOrder: () => void;
    closeModal: () => void;
}

function MealOrder({shopData, mealArr, updateMealOrderArr, resetOrder, closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const ordersContext: OrdersContextType = useContext(OrdersContext);
    const [blockedUser, setBlockedUser] = useState(false);
    const [orderList, setOrderList] = useState<MealOrderElm[]>([]);
    const [address, setAddress] = useState(userContext.user.address);
    const [addressregister, setAddressRegister] = useState(false);
    const addressEl = useRef<HTMLTextAreaElement>(null);
    const [sumtotal, setSumTotal] = useState(0);
    const [addresserr, setAddressErr] = useState('');
    const [ordersubmiterr, setOrderSubmitErr] = useState('');
    const [inPost, setInPost] = useState(false);

    useEffect(() => {
       let total = 0;
       const orderArr = mealArr.filter(item => {
          if (!item.quantity){
            return false;
          }
          total += item.quantity * item.unitprice;
          return true;
       });
       setOrderList(orderArr);
       setSumTotal(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    useEffect(() => {
      if (shopData &&  shopData.blockusers && shopData.blockusers.includes(userContext.user.id as string)){
         setBlockedUser(true);
      }
    },[shopData, userContext]);

    function changeOrderQty(e: FormEvent, idx: number){
        const quantity = Number((e.target as HTMLInputElement).value);
        if (quantity < 1){
           return;
        }
        const orderArr = orderList.slice();
        orderArr[idx] = {...orderArr[idx], quantity};
        setOrderList(orderArr);
        let total = 0;
        for (let elm of orderArr){
            total += (elm.quantity as number) * elm.unitprice;
        }
        setSumTotal(total);
        updateMealOrderArr(orderArr);
    }

    function handleAddressChange(e: FormEvent<HTMLTextAreaElement>){
      let { value } = e.target as HTMLTextAreaElement;
      //Remove all the markups to prevent Cross-site Scripting attacks
      value = value.replace(/<\/?[^>]*>/g, "");
    }

    function resetErrMsg(){
      setAddressErr('');
      setOrderSubmitErr('');
    }

    async function submitOrder(){
        resetErrMsg(); 
        if (!userContext.isLoggedIn && blockedUser){
           return;
        }
        //Check if Address is filled
        if (!address?.trim()){
            setAddress(prevState => prevState?.trim()) 
            setAddressErr("Please type your delivering address, this field is required!");
            addressEl.current?.focus();
            return;
        }
        const dataSubmit = {
           userId: userContext.user.id,
           userName: userContext.user.name,
           shopId: shopData.id,
           shopName: shopData.shopname,
           owner: shopData.owner,
           orderList,
           sum: sumtotal,
           tax: Math.round((sumtotal*taxRate + Number.EPSILON) * 100) / 100,
           address,
           addressregister
        }
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        setInPost(true);
        try {
          // Send request to our api route
          const { data } = await axios.post('/api/placeorder', dataSubmit, { headers: headers });
          setInPost(false);
          if (data.no_authorization){
             setOrderSubmitErr("No authorization to upload data.");
             return;
          }
          if (addressregister){
             const user = {...userContext.user, address};
             store('user', JSON.stringify(user));
             userContext.login(user);
          }
          
          //Update ordersContext & store currorders
          const orderData = {...data, shopName: shopData.shopname};
          const orderList = ordersContext.orderlist.slice();
          orderList.push(orderData);
          ordersContext.update(orderList);
          const mealOrders = {logintime: Math.round(new Date().getTime() / 1000), userId: userContext.user.id, orderList}
          store('currorders', JSON.stringify(mealOrders));

          //Update store myordershops 
          const myOrderShops = JSON.parse(store('myordershops'));
          const currTime = Math.round(new Date().getTime() / 1000);
          if (myOrderShops && myOrderShops.userId === userContext.user.id && currTime < (myOrderShops.logintime + 60 * 10)){
             const shopList = myOrderShops.shopList;
             const idx = shopList.findIndex((item: OrderShopsElm) => item.id === shopData.id);
             if (idx > -1){
                const count = shopList[idx].count;
                shopList[idx] = {...shopList[idx], count: count + 1};
             }else{
                shopList.push({id: shopData.id, shopname: shopData.shopname, profileimage: shopData.profileimage, count: 1, cancel: 0});
             }
             store('myordershops', JSON.stringify({ userId: userContext.user.id, logintime: Math.round(new Date().getTime() / 1000), shopList}));
          }else{
             store.remove('myordershops');
          }
          
          resetOrder();
          closeModal();
        }catch(err){
          setInPost(false);
          setOrderSubmitErr('Failed to upload data to database!');
        }
    }

    return ((userContext && ordersContext) &&
        <div className={deliveryStyle.container}>
          <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
              Draft Order Details To {shopData.shopname}
             <Tooltip title="Close" arrow>
                <div className="float-right" style={{cursor: 'pointer'}} onClick={() => closeModal()}>
                   <span className="material-icons">close</span>
                </div>
             </Tooltip>
          </div>
          <div className={deliveryStyle.container_body}>
            {!userContext.isLoggedIn &&
               <h4 style={{color: 'red'}}>Please log in first to place orders.</h4>
            }
            <table>
                <thead>
                  <tr>
                    <th>Meal</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                {orderList.map((item: MealOrderElm, idx: number) => 
                    <tr key={item.id}>
                       <td style={{width: '40%'}}>{item.mealname}</td>
                       <td style={{width: '20%'}}>{`$${item.unitprice}`}</td>
                       <td style={{width: '20%'}}><input type="number" min="1" value={item.quantity} onChange={(e) => changeOrderQty(e, idx)} /></td>
                       <td className="text-right" style={{width: '20%'}}>{`$${item.unitprice*(item.quantity as number)}`}</td>
                    </tr> 
                )} 
                  <tr>
                    <td style={{width: '40%', fontWeight: 'bold'}}>Sum</td>
                    <td style={{width: '20%'}}></td>
                    <td style={{width: '20%'}}></td>
                    <td className="text-right" style={{width: '20%'}}>{`$${sumtotal}`}</td>
                 </tr>   
                 <tr>
                    <td style={{width: '40%', fontWeight: 'bold'}}>Tax({`${taxRate*100}%`})</td>
                    <td style={{width: '20%'}}></td>
                    <td style={{width: '20%'}}></td>
                    <td className="text-right" style={{width: '20%'}}>{`$${(sumtotal*taxRate).toFixed(2)}`}</td>
                 </tr>   
                 <tr>
                    <td style={{width: '40%', fontWeight: 'bold'}}>Total Amount</td>
                    <td style={{width: '20%'}}></td>
                    <td style={{width: '20%'}}></td>
                    <td className="text-right" style={{width: '20%'}}>{`$${(sumtotal*(1+taxRate)).toFixed(2)}`}</td>
                 </tr>   
               </tbody>
           </table> 
           <div>
           {(orderList.length > 0 && userContext.isLoggedIn && !blockedUser) &&
             <>
             <label>Delivering Address</label>
             <textarea
               name="address"  
               value={address}
               placeholder="Address"
               style={{lineHeight:'1.25rem'}}
               onChange={(e) => setAddress(e.target.value.replace(/<\/?[^>]*>/g, ""))}
               ref={addressEl}    
               />
             {(address && address.trim() !== userContext.user.address) &&
               <div className="clearfix" onClick={() => setAddressRegister(!addressregister)} style={{cursor: 'pointer'}}><div className="float-left"><span className="material-icons">{addressregister ? 'check_box': 'check_box_outline_blank'}</span></div><div>&nbsp;&nbsp;Use this address as your member address</div></div>
             }
             <div className="mark" style={{color: 'red'}}>{addresserr}</div>
             <button className="button" onClick={() => submitOrder()}>Place This Order</button>
             <div className="mark" style={{color: 'red'}}>{ordersubmiterr}</div>
             </>
           }
           </div>
          </div>
          {inPost &&
              <div className={loaderStyles.loadermodal}>
                <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
              </div>
          }
        </div>
    );
}    

export default MealOrder;
