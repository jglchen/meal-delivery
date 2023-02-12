import { useContext, Fragment } from 'react';
import axios from 'axios';
import store from 'store2';
import Tooltip from '@mui/material/Tooltip';
import useSWR from 'swr';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContext} from './Context';
import { UserContextType } from '@/lib/types';
import { getUserTypeDescr } from '@/lib/utils';

interface PropsType {
    userId: string;
    closeModal: () => void;
}

function UserDetail({userId, closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const fetcher = async (url: string) => { 
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      return axios.get(url, { headers: headers }).then(res => res.data)
    };
    const { data: userData, mutate: userMutate } = useSWR(`/api/getuserdetail/${userId}`, fetcher);

    return(userContext &&
        <div className={deliveryStyle.container}>
          <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
             User Profile Detail
             <Tooltip title="Close" arrow>
                <div className="float-right" style={{cursor: 'pointer'}} onClick={() => closeModal()}>
                   <span className="material-icons">close</span>
                </div>
             </Tooltip>
          </div>
          <div className={deliveryStyle.container_body}>
          {!userData &&
            <h2>Please wait. Data is loading....</h2>   
          }
          {userData &&
           <>
           <div className={deliveryStyle.item}>
             Name: {userData.name}
           </div>
           <div className={deliveryStyle.item}>
             Email: {userData.email}
           </div>
           <div className={deliveryStyle.item}>
             Phone: {userData.phone}
           </div>
           <div className={deliveryStyle.item}>
            Address: {userData.address.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
              return (
                <Fragment key={index}>
                <br />{itm}
                </Fragment>
              )
            })}
           </div>
           <div className={deliveryStyle.item}>
             User Type: {getUserTypeDescr(userData.usertype)}
           </div>
          <div className={deliveryStyle.item}>
             Join Date: {new Date(userData.created).toLocaleString()}
           </div>
           </>
          }  
          </div>
        </div>
    );
}

export default UserDetail;
