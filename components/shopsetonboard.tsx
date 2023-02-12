import { useState, useRef, useContext, Fragment } from 'react';
import axios from 'axios';
import ReactModal from 'react-modal';
import {UserContext} from '@/components/Context';
import useSWR from 'swr';
import 'material-icons/iconfont/material-icons.css';
import loaderStyles from '@/styles/loader.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContextType, ShopRecord} from '@/lib/types';
import { pageSizeShops } from '@/lib/utils';
import DisplayImage from './displayimage';
import UserDetail from './userdetail';

interface PropsType {
    closeShopsOnboard: () => void;
}

function ShopsSetOnBoard(props: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const fetcher = async (url: string) => { 
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      return axios.get(url, { headers: headers }).then(res => res.data)
    };
    const [pageIndex, setPageIndex] = useState(0);
    const [reviewIndex, setReviewIndex] = useState(-1);
    const [shopOnboardErr, setShopOnboardErr] = useState('');
    const [ownerId, setOwnerId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [inPost, setInPost] = useState(false);
    const { data: shopsData, mutate: shopsMutate } = useSWR(`/api/getpotentialshops?page=${pageIndex}`, fetcher);
    
  
    async function setShopOnboard(item: ShopRecord){
      if (!confirm(`Do you want to set ${item.shopname} onboard?`)){
         return;     
      }
      
      setShopOnboardErr('');
      setInPost(true);
      try {
          const {encryptStorage} = await import('@/lib/encryptStorage');
          const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
          const {data} = await axios.put('/api/setshoponboard', item, { headers: headers });
          setInPost(false);
          if (data.no_authorization){
            setShopOnboardErr("No authorization to update");
              return;
          }
          setReviewIndex(-1);
          const shopsArr = shopsData.slice().filter((itm: ShopRecord) => itm.id !== item.id);
          shopsMutate(shopsArr);
      }catch(e){
          setInPost(false);
          setShopOnboardErr("Failed to set this restaurant onboard.");
      }
  
    } 
    
    function closeModal(){
      setShowModal(false);
    }
    
    function closeCallBack(){
       if (props.closeShopsOnboard){
          props.closeShopsOnboard();
       }
    }
    
    return (userContext &&
        <div className={loaderStyles.container}>
           <div className={lightBoxStyles.heading}>
               Set Newly Added Restaurants Onboard
           </div>
           <div>
             <button className="muted-button float-right button" style={{marginRight: '0.5rem'}} onClick={closeCallBack}>Close</button>
           </div>
           {!shopsData &&
           <h2>Please wait. Data is loading....</h2>   
           }
           {shopsData &&
           <>
           <table>
               <thead>
                <tr>
                    <th>Restaurant Name</th>
                    <th>Food Supply</th>
                    <th>Action</th>
                </tr>
               </thead>
               <tbody>
               {shopsData.map((item: ShopRecord, idx: number) => 
                 <>
                 <tr key={item.id}>
                    <td>{item.shopname}</td>
                    <td>
                    {item.foodsupply?.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
                        return (
                          <Fragment key={index}>
                          {itm}<br />
                          </Fragment>
                        )
                    })}
                    </td>
                    <td className='text-center'>
                    {reviewIndex !== idx &&
                      <button className="accent-button" onClick={() => {setShopOnboardErr('');setReviewIndex(idx);}}>Review</button>
                    }  
                    </td>
                 </tr>
                 {reviewIndex === idx &&
                 <tr>
                    <td>
                        <DisplayImage alt="" src={item.profileimage} />
                    </td>
                    <td colSpan={2}>
                      <div className={deliveryStyle.flex_container}>
                        <div>Name: {item.shopname}</div>
                        <div>Owner: <a onClick={() => {setOwnerId(item.owner.id); setShowModal(true); return false;}} style={{cursor: 'pointer'}}>{item.owner.name}</a></div>
                        <div>Food Supply: {item.foodsupply?.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((itm: string, index: number) =>{
                          return (
                            <Fragment key={index}>
                            <br />{itm}
                            </Fragment>
                          )
                        })}
                        </div>
                        <div><button onClick={() => setShopOnboard(item)}>Set This Restaurant Onboard</button></div>
                      </div>
                      <div className="mark" style={{color: 'red'}}>{shopOnboardErr}</div>
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
           {pageSizeShops === shopsData.length &&
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
           <ReactModal 
            isOpen={showModal}
            contentLabel="onRequestClose Modal"
            onRequestClose={() => setShowModal(false)}
            className={deliveryStyle.Modal}
            overlayClassName={lightBoxStyles.lightbox}
           >
             <UserDetail userId={ownerId} closeModal={closeModal} />
           </ReactModal>
        </div>
    );
}

export default ShopsSetOnBoard;