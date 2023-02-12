import { useState, useContext, Fragment } from 'react';
import axios from 'axios';
import {UserContext} from '@/components/Context';
import useSWR from 'swr';
import 'material-icons/iconfont/material-icons.css';
import loaderStyles from '@/styles/loader.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContextType, UserData} from '@/lib/types';
import { pageSizeToOwners } from '@/lib/utils';


interface PropsType {
    closeUsersToOwners: () => void;
}

function UsersToOwners(props: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const fetcher = async (url: string) => { 
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      return axios.get(url, { headers: headers }).then(res => res.data)
    };
    const [pageIndex, setPageIndex] = useState(0);
    const [reviewIndex, setReviewIndex] = useState(-1);
    const [toOwnerErr, setToOwnerErr] = useState('');
    const [inPost, setInPost] = useState(false);
    const { data: usersData, mutate: usersMutate } = useSWR(`/api/getpotentialowners?page=${pageIndex}`, fetcher);
    
    async function setUserToOwner(item: UserData){
      if (!confirm(`Do you want to set ${item.name} as restaurant owner?`)){
         return;     
      }

      setToOwnerErr('');
      setInPost(true);
      try {
          const {encryptStorage} = await import('@/lib/encryptStorage');
          const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
          const {data} = await axios.put('/api/setusertoowner', {id: item.id}, { headers: headers });
          setInPost(false);
          if (data.no_authorization){
              setToOwnerErr("No authorization to update");
              return;
          }
          setReviewIndex(-1);
          const usersArr = usersData.slice().filter((itm: UserData) => itm.id !== item.id);
          usersMutate(usersArr);
      }catch(e){
          setInPost(false);
          setToOwnerErr("Failed to set this user as restaurant owner.");
      }
    }
    
    function closeCallBack(){
       if (props.closeUsersToOwners){
          props.closeUsersToOwners();
       }
    }
    
    return (userContext &&
        <div className={loaderStyles.container}>
           <div className={lightBoxStyles.heading}>
               Set Selected Users to Restaurant Owners
           </div>
           <div>
             <button className="muted-button float-right button" style={{marginRight: '0.5rem'}} onClick={closeCallBack}>Close</button>
           </div>
           {!usersData &&
           <h2>Please wait. Data is loading....</h2>   
           }
           {usersData &&
           <>
           <table>
               <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Action</th>
                </tr>
               </thead>
               <tbody>
               {usersData.map((item: UserData, idx: number) => 
                 <>
                 <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td className='text-center'>
                    {reviewIndex !== idx &&
                      <button className="accent-button" onClick={() => {setToOwnerErr('');setReviewIndex(idx);}}>Review</button>
                    }  
                    </td>
                 </tr>
                 {reviewIndex === idx &&
                 <tr>
                    <td colSpan={3}>
                    <div className={deliveryStyle.flex_container}>
                      <div>Name: {item.name}</div>
                      <div>Email: {item.email}</div>
                      <div>Phone: {item.phone}</div>
                      <div>Address:
                      {item.address?.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
                        return (
                          <Fragment key={index}>
                          <br />{itm}
                          </Fragment>
                        )
                      })}    
                      </div>
                      <div>Join Date: {new Date(item.created).toLocaleString()}</div>
                      <div><button onClick={() => setUserToOwner(item)}>Set This User as Shop Owner</button></div>
                    </div>
                    <div className="mark" style={{color: 'red'}}>{toOwnerErr}</div>
                    </td>
                 </tr> 
                 } 
               
                 </>
               )}
               </tbody>
           </table> 
           <div>
           {pageIndex > 0 && 
                <button className="muted-button" onClick={() => setPageIndex(pageIndex - 1)}>&larr;  Previous</button>
           }
           {pageSizeToOwners === usersData.length &&
                <button className="muted-button" onClick={() => setPageIndex(pageIndex + 1)}>Next  &rarr;</button>
           }
           </div>
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

export default UsersToOwners;