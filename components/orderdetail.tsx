import { useContext, Fragment } from 'react';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import { UserContext, OrdersContext } from './Context';
import { UserContextType, OrdersContextType, ShopDataType, MealOrderElm, MealOrderType} from '@/lib/types';
import { orderStatusDescr } from '@/lib/utils';

interface PropsType {
    userCategory: string;
    mealOrder: MealOrderType;
    closeModal: () => void;
}

function OrderDetail({userCategory, mealOrder, closeModal}: PropsType){
   const userContext: UserContextType = useContext(UserContext);

   return (userContext &&
      <div className={deliveryStyle.container}>
         <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
            {userCategory === 'user' ?
               `Order Details To ${mealOrder.shopName}`:
               (userCategory === 'owner' ? `${mealOrder.userName}'s Order Details`: ``)     
            }
            <Tooltip title="Close" arrow>
               <div className="float-right" style={{cursor: 'pointer'}} onClick={() => closeModal()}>
                  <span className="material-icons">close</span>
               </div>
            </Tooltip>
         </div>
         <div className={deliveryStyle.container_body}>
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
               {mealOrder.orderList.map((item: MealOrderElm, idx: number) => 
                  <tr key={item.id}>
                     <td style={{width: '34%'}}>{item.mealname}</td>
                     <td className="text-right" style={{width: '22%'}}>{`$${item.unitprice}`}</td>
                     <td className="text-right" style={{width: '22%'}}>{item.quantity}</td>
                     <td className="text-right" style={{width: '22%'}}>{`$${item.unitprice*(item.quantity as number)}`}</td>
                  </tr> 
               )} 
               <tr>
                  <td style={{width: '34%', fontWeight: 'bold'}}>Sum</td>
                  <td style={{width: '22%'}}></td>
                  <td style={{width: '22%'}}></td>
                  <td className="text-right" style={{width: '22%'}}>{`$${mealOrder.sum}`}</td>
               </tr>   
               <tr>
                  <td style={{width: '34%', fontWeight: 'bold'}}>Tax</td>
                  <td style={{width: '22%'}}></td>
                  <td style={{width: '22%'}}></td>
                  <td className="text-right" style={{width: '22%'}}>{`$${mealOrder.tax}`}</td>
               </tr>   
               <tr>
                  <td style={{width: '34%', fontWeight: 'bold'}}>Total Amount</td>
                  <td style={{width: '22%'}}></td>
                  <td style={{width: '22%'}}></td>
                  <td className="text-right" style={{width: '22%'}}>{`$${(mealOrder.sum+mealOrder.tax).toFixed(2)}`}</td>
               </tr>   
               </tbody>
            </table>   

            
            
            <div>Order Status:</div>         
            <table>
               <thead>
                  <tr>
                     <th>Status</th>
                     <th>Time</th>
                  </tr>
                  {mealOrder.statushistory.map((item: string, idx: number) => {
                      if (idx === 0 || (idx === 1 && mealOrder.orderstatus == 1)){
                         return (
                           <tr key={idx}>
                              <td style={{width: '50%'}}>{orderStatusDescr[idx]}</td>
                              <td style={{width: '50%'}}>{(new Date(item)).toLocaleString()}</td>
                           </tr>
                         );
                      }
                      return (
                        <tr key={idx}>
                           <td style={{width: '50%'}}>{orderStatusDescr[idx+1]}</td>
                           <td style={{width: '50%'}}>{(new Date(item)).toLocaleString()}</td>
                        </tr>
                      );
                  })} 
               </thead>
            </table>
            {userCategory === 'owner' &&
            <>  
            <div>Delivering Address:</div>         
            <div>
            {mealOrder.address.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
              return (
                <Fragment key={index}>
                {itm}<br />
                </Fragment>
              )
            })}
            </div>
            </>
            }
         </div>   
      </div>
   );

}    

export default OrderDetail;
