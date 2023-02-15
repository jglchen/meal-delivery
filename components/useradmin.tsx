import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import store from 'store2';
import {UserContext} from '@/components/Context';
import PersonalEdit from './personaledit';
import UsersToOwners from './userstoowners';
import ShopManage from './shopmanage';
import ShopsSetOnBoard from './shopsetonboard';
import dropDownStyles from '@/styles/dropdown.module.css';
import deliveryStyles from '@/styles/delivery.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContextType} from '@/lib/types';

const OrderManage = dynamic(() => import('./ordermanage'));

function UserAdmin(){
   const userContext: UserContextType = useContext(UserContext);
   const [personalInfo, setPersonalInfo] = useState(false);
   const [shopManageScreen, setShopManageScreen] = useState(false);
   const [usersToScreen, setUsersToScreen] = useState(false);
   const [shopsOnboard, setShopsOnboard] = useState(false);
   const [currentUrl, setCurrentUrl] = useState('');
   const [shopId, setShopId] = useState('');
   const [inPost, setInPost] = useState(false);
   const router = useRouter();

   useEffect(() => {
      setCurrentUrl(window.location.href);
   },[]);

   useEffect(() => {
      if (userContext && userContext.user.shopid && userContext.user.shopid.length > 0) {
         const shopIdArr = userContext.user.shopid.filter(itm => itm.onboard === true);
         if (shopIdArr.length > 0){
           setShopId(shopIdArr[0].id);
         }
      }
   },[userContext]);

   async function signOut(){
      store.remove('user'); 
      userContext.logout();
      const {encryptStorage} = await import('@/lib/encryptStorage');
      encryptStorage.removeItem('token');
   }
   
   function closePeronalEdit(){
      setPersonalInfo(false);
   }

   function closeShopManage(){
      setShopManageScreen(false);
   }

   function closeUsersToOwners(){
      setUsersToScreen(false);
   }

   function closeShopsOnboard(){
      setShopsOnboard(false);
   }

   function initInPost(){
      setInPost(true);
   }
  
   function stopInPost(){
      setInPost(false);
   }
   return (userContext &&
      <> 
      <div className={deliveryStyles.user_head}>
         <div>Hi! {userContext.user.name || ''}</div>
         <div>
            {userContext.user.usertype === 2 &&
            <>
               {currentUrl.includes('/mealmenu/') &&
               <>
               <button className="muted-button button" onClick={() => router.push('/')}>Shop Orders</button> 
               <button className="muted-button button" onClick={() => setShopManageScreen(true)}>Shop Admin</button> 
               <button className="muted-button button" style={{backgroundColor: 'lightyellow', cursor: 'none'}}>Personal Orders</button> 
               </>
               }
               {(!currentUrl.includes('/mealmenu/') && userContext.showShopGuide) &&
               <>
               <button className="muted-button button" onClick={() => userContext.indexpageswitch()}>Shop Orders</button> 
               <button className="muted-button button" onClick={() => setShopManageScreen(true)}>Shop Admin</button> 
               <button className="muted-button button" style={{backgroundColor: 'lightyellow', cursor: 'none'}}>Personal Orders</button> 
               </>
               }
               {(!currentUrl.includes('/mealmenu/') && !userContext.showShopGuide) &&
               <>
               <button className="muted-button button" style={{backgroundColor: 'lightyellow', cursor: 'none'}}>Shop Orders</button> 
               <button className="muted-button button" onClick={() => setShopManageScreen(true)}>Shop Admin</button> 
               <button className="muted-button button" onClick={() => userContext.indexpageswitch()}>Personal Orders</button> 
               </>
               }
            </>
            } 
            {userContext.user.usertype === 3 &&
            <div className={`${dropDownStyles.dropdown}`}>
               <button className="muted-button button">Shop Admin</button>
               <div className={dropDownStyles.dropdown_content}>
                  <ul>
                     <li><div onClick={() => setUsersToScreen(true)}>Set Users To Owners</div></li>
                     <li><div onClick={() => setShopsOnboard(true)}>Set Shops On Board</div></li>
                  </ul>                 
               </div>
            </div>
            }
            <button className="muted-button button" onClick={() => setPersonalInfo(true)}>My Info</button> 
            <button className="muted-button button" onClick={() => signOut()}>Sign Out</button>
         </div>
      </div>
      {(userContext.user.usertype === 2 && !userContext.showShopGuide && !currentUrl.includes('/mealmenu/')) &&
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
      {personalInfo &&
         <div className={lightBoxStyles.lightbox}>
            <div className={lightBoxStyles.module}>
               <div className="container">
                  <PersonalEdit closePeronalEdit={closePeronalEdit} />
               </div>
            </div>
         </div> 
      }
      {shopManageScreen &&
         <div className={lightBoxStyles.lightbox}>
            <div className={lightBoxStyles.module}>
               <div className="container">
                  <ShopManage closeShopManage={closeShopManage} />
               </div>
            </div>
         </div> 
      }
      {usersToScreen &&
         <div className={lightBoxStyles.lightbox}>
            <div className={lightBoxStyles.module}>
               <div className="container">
                  <UsersToOwners closeUsersToOwners={closeUsersToOwners} />
               </div>
            </div>
         </div> 
      }
      {shopsOnboard &&
         <div className={lightBoxStyles.lightbox}>
            <div className={lightBoxStyles.module}>
               <div className="container">
                  <ShopsSetOnBoard closeShopsOnboard={closeShopsOnboard} />
               </div>
            </div>
         </div> 
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

      </>   
   );
}


export default UserAdmin;