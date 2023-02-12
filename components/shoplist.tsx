import { useState, useEffect, useRef, useContext, Fragment } from 'react';
import Link from 'next/link';
import {UserContext} from '@/components/Context';
import UserOrders from './userorders';
import UserOrderRecords from './userorderrecords';
import DisplayImage from './displayimage';
import deliveryStyle from '@/styles/delivery.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import { UserContextType, ShopDataType } from '@/lib/types';
  
interface PropsType {
    shopListData: ShopDataType[];
}

function ShopList({shopListData}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [selfShops, setSelfShops] = useState<string[]>([]);
    const [blockingShops, setBlockingShops] = useState<string[]>([]);
    const [orderRecords, setOrderRecords] = useState(false);

    useEffect(() => {
       if (userContext) {
          if (userContext.user){
            if (userContext.user.shopid && userContext.user.shopid.length > 0){
              const shopList = [];
              for (let elm of userContext.user.shopid){
                if (elm.onboard){
                  shopList.push(elm.id);
                }
              }
              setSelfShops(shopList);
            }
            const blockShops = [];
            for (let elm of shopListData){
              if (elm.blockusers && elm.blockusers.includes(userContext.user.id as string)){
                 blockShops.push(elm.id);
              }
            }
            setBlockingShops(blockShops); 
          }
       }
    },[userContext, shopListData]);

    function closeOrderRecords(){
      setOrderRecords(false);
    }
    
    return (userContext &&
      <Fragment>
        <UserOrders />
        {(userContext && userContext.isLoggedIn) &&
          <div className={deliveryStyle.item}>
            <button className="muted-button button" onClick={() => setOrderRecords(true)}>My Purchase Order Records</button> 
          </div>   
        }
        <div className={deliveryStyle.item}>
         {(shopListData && shopListData.length > 0) &&
          <div className={deliveryStyle.flex_container}>
           {shopListData.filter(item => !selfShops.includes(item.id) && !blockingShops.includes(item.id)).map((item) => 
            <div key={item.id}>
              <Link href={`/mealmenu/${item.id}`} style={{color: 'initial'}}>
                  <div className="clearfix">
                    <div className="float-left">
                      <DisplayImage  alt="" src={item.profileimage as string} />
                    </div>
                    <div className="float-left" style={{paddingLeft: '0.5rem', width:'calc(100% - 128px)'}}>
                      <div style={{fontWeight: 'bold'}}>{item.shopname}</div>
                      <div>
                      {item.foodsupply.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index:number) =>{
                        return (
                         <Fragment key={index}>
                         {itm}<br />
                         </Fragment>
                        )
                      })}
                      </div>
                    </div>
                  </div>
              </Link>   
            </div>
            )} 
          </div>
         }
        </div>
        {orderRecords &&
         <div className={lightBoxStyles.lightbox}>
            <div className={lightBoxStyles.module}>
               <div className="container">
                  <UserOrderRecords closeOrderRecords={closeOrderRecords} />
               </div>
            </div>
         </div> 
        }
      </Fragment>  
    );

}

export default ShopList;
