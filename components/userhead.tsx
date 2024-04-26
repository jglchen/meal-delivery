import { useState, useContext, Fragment } from 'react';
import Tooltip from '@mui/material/Tooltip';
import {UserContext} from '@/components/Context';
import UserAdmin from './useradmin';
import UserAuth from './userauth';
import AboutApp from './aboutapp';
import {UserContextType} from '@/lib/types';
import lightBoxStyles from '@/styles/lightbox.module.css';

function UserHead(){
    const userContext: UserContextType = useContext(UserContext);
    const [aboutInfo, setAboutInfo] = useState(false);

    function closeAboutInfo(){
        setAboutInfo(false);
    }
    
    return (userContext && 
        <Fragment>
          <h1 className="text-center" style={{display:'flex', justifyContent:'space-between'}}>
            <div></div>
            Welcome to Happy Eats!
            <div>
              <Tooltip title="About this app" arrow>
                <button className="muted-button button button-right" onClick={() => setAboutInfo(true)}>About</button>               
              </Tooltip>
            </div>
          </h1>
          {/* 
          <h5 className="text-right">
             React Native Expo Publish: <a href="https://exp.host/@jglchen/meal-delivery" target="_blank" rel="noreferrer">https://exp.host/@jglchen/meal-delivery</a>
          </h5> 
          */}          
          {userContext.isLoggedIn ?
             (<UserAdmin />)
             :
             (<UserAuth />)
          }  
          {aboutInfo &&
            <div className={lightBoxStyles.lightbox}>
               <div className={lightBoxStyles.module}>
                  <div className="container">
                    <AboutApp closeAboutInfo={closeAboutInfo} />
                  </div>
               </div>
            </div> 
          }
        </Fragment>
    )
}

export default UserHead;
