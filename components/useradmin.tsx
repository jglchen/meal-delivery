import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/router';
import store from 'store2';
import {UserContext} from '@/components/Context';
import PersonalEdit from './personaledit';
import UsersToOwners from './userstoowners';
import ShopManage from './shopmanage';
import ShopsSetOnBoard from './shopsetonboard';
import dropDownStyles from '@/styles/dropdown.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import {UserContextType} from '@/lib/types';

function UserAdmin(){
   const userContext: UserContextType = useContext(UserContext);
   const [personalInfo, setPersonalInfo] = useState(false);
   const [shopManageScreen, setShopManageScreen] = useState(false);
   const [usersToScreen, setUsersToScreen] = useState(false);
   const [shopsOnboard, setShopsOnboard] = useState(false);
   const [currentUrl, setCurrentUrl] = useState('');
   const router = useRouter();

   useEffect(() => {
      setCurrentUrl(window.location.href);
   },[]);

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

   return (userContext &&
      <> 
      <div style={{padding: '0.5rem', display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
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