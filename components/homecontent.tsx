import { useContext, Fragment } from 'react';
import {UserContext} from './Context';
import ShopOrders from './shoporders';
import ShopList from './shoplist';
import { UserContextType, ShopDataType } from '@/lib/types';

interface PropsType {
    shopListData: ShopDataType[];
}

function HomeContent({shopListData}: PropsType){
    const userContext: UserContextType = useContext(UserContext);

    return(userContext && 
       <Fragment>
         {/*(userContext.user.usertype === 2 && !userContext.showShopGuide) &&
            <ShopOrders />
         */} 
         {(userContext.user.usertype !== 2 || userContext.showShopGuide) &&
           <ShopList shopListData={shopListData} />
         }
       </Fragment>
    );
}


export default HomeContent;
