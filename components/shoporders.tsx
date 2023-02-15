import { useState, useEffect, useContext } from 'react';
import {UserContext} from '@/components/Context';
import 'material-icons/iconfont/material-icons.css';
import OrderManage from './ordermanage';
import loaderStyles from '@/styles/loader.module.css';
import { UserContextType } from '@/lib/types';

function ShopOrders(){
   const userContext: UserContextType = useContext(UserContext);
   const [shopId, setShopId] = useState('');
   const [inPost, setInPost] = useState(false);

   useEffect(() => {
      if (userContext && userContext.user.shopid && userContext.user.shopid.length > 0) {
         const shopIdArr = userContext.user.shopid.filter(itm => itm.onboard === true);
         if (shopIdArr.length > 0){
           setShopId(shopIdArr[0].id);
         }
      }
   },[userContext]);

   function initInPost(){
      setInPost(true);
   }
  
   function stopInPost(){
      setInPost(false);
   }

   return (userContext &&
      <div className={loaderStyles.container}>
         {userContext.user.usertype === 2 &&
         <>
           <div>
           {(userContext.user.shopid && userContext.user.shopid.length > 0 && userContext.user.shopid.filter(itm => itm.onboard === true).length > 0) &&
             <div> 
             <label htmlFor="shopIDSelect">My Restaurants</label>
             <select value={shopId} id="shopIDSelect" onChange={(e) => setShopId(e.currentTarget.value)}>
             {userContext.user.shopid.filter(itm => itm.onboard === true)
              .map(itm => <option key={itm.id} value={itm.id}>{itm.shopname}</option>)
             }   
             </select>
             </div> 
           }
           {(!userContext.user.shopid || userContext.user.shopid.length === 0 || userContext.user.shopid.filter(itm => itm.onboard === true).length === 0) &&
            <h5>Currently No Restaurant Under My Management</h5>
           }
           </div>
           {shopId && 
              <OrderManage 
                  shopId={shopId} 
                  initInPost={initInPost}
                  stopInPost={stopInPost}
                  />
           }
         </>
         }
         {inPost &&
            <div className={loaderStyles.loadermodal}>
               <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
            </div>
         }
     </div>
   );

}

export default ShopOrders;