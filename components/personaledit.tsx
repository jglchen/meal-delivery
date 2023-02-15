import { useState, useRef, useContext, FormEvent, Fragment } from 'react';
import axios from 'axios';
import passwordValidator from 'password-validator';
import {UserContext} from '@/components/Context';
import store from 'store2';
import 'material-icons/iconfont/material-icons.css';
import loaderStyles from '@/styles/loader.module.css';
import lightBoxStyles from '@/styles/lightbox.module.css';
import deliveryStyle from '@/styles/delivery.module.css';
import {UserContextType} from '@/lib/types';
import {getUserTypeDescr} from '@/lib/utils';

interface PropsType {
    closePeronalEdit: () => void;
}

function PersonalEdit(props: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [name, setName] = useState('');
    const [nameerr, setNameErr] = useState('');
    const nameEl = useRef<HTMLInputElement | null>(null);
    const [passwd, setPasswd] = useState('');
    const [passwderr, setPasswdErr] = useState('');
    const passwdEl = useRef<HTMLInputElement | null>(null);
    const [phone, setPhone] = useState('');
    const [phoneerr, setPhoneErr] = useState('');
    const phoneEl = useRef<HTMLInputElement | null>(null);
    const [address, setAddress] = useState('');
    const [addresserr, setAddressErr] = useState('');
    const addressEl = useRef<HTMLTextAreaElement | null>(null);
    const [tobeowner, setTobeOwner] = useState(false);
    const [tobeownererr, setTobeOwnerErr] = useState('');
    const [updateName, setUpdateName] = useState(false);
    const [updatePasswd, setUpdatePasswd] = useState(false);
    const [updatePhone, setUpdatePhone] = useState(false);
    const [updateAddress, setUpdateAddress] = useState(false);
    const [updateTobeOwner, setUpdateTobeOwner] = useState(false);
    const [inPost, setInPost] = useState(false);
    
    function handleNameChange(e: FormEvent<HTMLInputElement>){
        let { value } = e.currentTarget;
        //Remove all the markups to prevent Cross-site Scripting attacks
        value = value.replace(/<\/?[^>]*>/g, "");
        setName(value);
    }

    function updateNameInit(){
        setUpdateName(true); 
        setName(userContext.user.name as string);       
    }
 
    function updateNameReset(){
        setName(userContext.user.name as string);
        setNameErr('');    
    }
 
    async function submitNameUpdate(){
        if (name.trim() === userContext.user.name){
            return;
        }
        setNameErr('');
        //Check if Name is filled
        if (!name.trim()){
           setNameErr("Please type your name, this field is required!");
           nameEl.current?.focus();
           return;
        }
        
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        setInPost(true);
        try {
            const {data} = await axios.put('/api/updateuser', {name: name.trim()}, { headers: headers });
            setInPost(false);
            if (data.no_authorization){
                setNameErr("No authorization to update");
                nameEl.current?.focus();
                return;
            }
              
            const user = {...userContext.user, name: name};
            store('user', JSON.stringify(user));
            userContext.login(user);
            setUpdateName(false);
        }catch(err){
            setInPost(false);
            setNameErr("Faile to update name");
        }
        
    }

    async function submitPasswdUpdate(){
        setPasswdErr('');
        //Check if Passwd is filled
        if (!passwd){
           setPasswdErr("Please type your password, this field is required!");
           passwdEl.current?.focus();
           return;
        }

        //Check the validity of password
        let schema = new passwordValidator();
        schema
        .is().min(8)                                    // Minimum length 8
        .is().max(100)                                  // Maximum length 100
        .has().uppercase()                              // Must have uppercase letters
        .has().lowercase()                              // Must have lowercase letters
        .has().digits(2)                                // Must have at least 2 digits
        .has().not().spaces();                          // Should not have spaces
        if (!schema.validate(passwd)){
            setPasswdErr("The password you typed is not enough secured, please retype a new one. The password must have both uppercase and lowercase letters as well as minimum 2 digits.");
            passwdEl.current?.focus();
            return;
        }
        
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        setInPost(true);
        try {
            const {data} = await axios.put('/api/updateuser', {password: passwd}, { headers: headers });
            setInPost(false);
            if (data.no_authorization){
                setPasswdErr("No authorization to update");
                passwdEl.current?.focus();
                return;
            }
            setUpdatePasswd(false);
        }catch(e){
            setInPost(false);
            setPasswdErr("Failed to update password");
        }
    }
    
    function updatePhoneInit(){
        setUpdatePhone(true); 
        setPhone(userContext.user.phone as string);       
    }
 
    function updatePhoneReset(){
        setPhone(userContext.user.phone as string); 
        setPhoneErr('');    
    }
    
    async function submitPhoneUpdate(){
        if (phone.trim() === userContext.user.phone){
            return;
        }
        setPhoneErr('');
        
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        setInPost(true);
        try {
            const {data} = await axios.put('/api/updateuser', {phone: phone.trim()}, { headers: headers });
            setInPost(false);
            if (data.no_authorization){
                setPhoneErr("No authorization to update");
                phoneEl.current?.focus();
                return;
            }
              
            const user = {...userContext.user, phone: phone};
            store('user', JSON.stringify(user));
            userContext.login(user);
            setUpdatePhone(false);
        }catch(err){
            setInPost(false);
            setPhoneErr("Failed to update phone");
        }
    }

    function updateAddressInit(){
        setUpdateAddress(true); 
        setAddress(userContext.user.address as string);  
    }
 
    function updateAddressReset(){
        setAddress(userContext.user.address as string); 
        setAddressErr('');  
    }
    
    async function submitAddressUpdate(){
        if (address.trim() === userContext.user.address){
            return;
        }
        setAddressErr('');
        
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        setInPost(true);
        try {
            const {data} = await axios.put('/api/updateuser', {address: address.trim()}, { headers: headers });
            setInPost(false);
            if (data.no_authorization){
                setAddressErr("No authorization to update");
                addressEl.current?.focus();
                return;
            }
              
            const user = {...userContext.user, address: address};
            store('user', JSON.stringify(user));
            userContext.login(user);
            setUpdateAddress(false);
        }catch(err){
            setInPost(false);
            setAddressErr("Failed to update address");
        }
    }

    function updateTobeOwnerInit(){
        setUpdateTobeOwner(true); 
        setTobeOwner(userContext.user.tobeowner as boolean);  
    }
 
    function updateTobeOwnerReset(){
        setTobeOwner(userContext.user.tobeowner as boolean);
        setTobeOwnerErr(''); 
    }
    
    async function submitTobeOwnerUpdate(){
        if (tobeowner === userContext.user.tobeowner){
            return;
        }
        setTobeOwnerErr('');
        
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        let objToDB;
        if (tobeowner){
            objToDB = {tobeowner: tobeowner, tobeownerAt: new Date().toISOString()};
        }else{
            objToDB = {tobeowner: tobeowner};
        }
        setInPost(true);
        try {
            const {data} = await axios.put('/api/updateuser', objToDB, { headers: headers });
            setInPost(false);
            if (data.no_authorization){
                setTobeOwnerErr("No authorization to update");
                return;
            }
              
            const user = {...userContext.user, tobeowner: tobeowner};
            store('user', JSON.stringify(user));
            userContext.login(user);
            setUpdateTobeOwner(false);
        }catch(err){
            setInPost(false);
            setTobeOwnerErr("Failed to update your intend listing of your restaurant in this app");
        }
    }
    
    function closeCallBack(){
       if (props.closePeronalEdit){
          props.closePeronalEdit();
       }
    }
    
    return (
        <div className={loaderStyles.container}>
           <div className={lightBoxStyles.heading}>
               Update My Personal Data
           </div>
           <div>
             <button className="muted-button float-right button button-right" onClick={closeCallBack}>Close</button>
           </div>
           {userContext && 
                <table>
                   <tbody>
                       <tr>
                           <td style={{width: '15%'}}>Name:</td>
                           {!updateName &&
                              <>
                                <td>{userContext.user.name}</td>
                                <td>
                                   <button className="float-right button button-right" onClick={() => {updateNameInit();}}>Update</button>
                                </td>
                             </>
                           }
                           {updateName &&
                              <>
                                <td>
                                   <input type="text" value={name} onChange={(e) => setName(e.target.value.replace(/<\/?[^>]*>/g, ""))} ref={nameEl} />
                                   <div className="mark" style={{color: 'red'}}>{nameerr}</div>
                                </td>
                                <td>
                                   {name.trim() !== userContext.user.name &&
                                     <>
                                     <button className="float-right button button-right" onClick={() => {updateNameReset();}}>Reset</button>
                                     <button className="float-right button button-right" onClick={submitNameUpdate}>Go Update</button>
                                     </>
                                   }
                               </td>
                             </>
                           }
                       </tr>

                       <tr>
                           <td style={{width: '15%'}}>Password:</td>
                           {!updatePasswd &&
                              <>
                                <td></td>
                                <td>
                                   <button className="float-right button button-right" onClick={() => {setUpdatePasswd(true);}}>Update</button>
                                </td>
                             </>
                           }
                           {updatePasswd &&
                              <>
                                <td>
                                   <input type="password" value={passwd} onChange={(e) => setPasswd(e.target.value.replace(/<\/?[^>]*>/g, "").trim())} ref={passwdEl} />
                                   <div className="mark" style={{color: 'red'}}>{passwderr}</div>
                                </td>
                                <td>
                                   {passwd &&
                                      <>
                                      <button className="float-right button button-right" onClick={() => {setPasswd('');setPasswdErr('');}}>Reset</button>
                                      <button className="float-right button button-right" onClick={submitPasswdUpdate}>Go Update</button>
                                      </>
                                   }
                               </td>
                             </>
                           }
                       </tr>

                       <tr>
                           <td style={{width: '15%'}}>Phone:</td>
                           {!updatePhone &&
                              <>
                                <td>{userContext.user.phone}</td>
                                <td>
                                   <button className="float-right button button-right" onClick={() => {updatePhoneInit();}}>Update</button>
                                </td>
                             </>
                           }
                           {updatePhone &&
                              <>
                                <td>
                                   <input type="text" value={phone} onChange={(e) => setPhone(e.target.value.replace(/<\/?[^>]*>/g, ""))} ref={phoneEl} />
                                   <div className="mark" style={{color: 'red'}}>{phoneerr}</div>
                                </td>
                                <td>
                                   {phone.trim() !== userContext.user.phone &&
                                     <>
                                     <button className="float-right button button-right" onClick={() => {updatePhoneReset();}}>Reset</button>
                                     <button className="float-right button button-right" onClick={submitPhoneUpdate}>Go Update</button>
                                     </> 
                                  }
                               </td>
                             </>
                           }
                       </tr>

                       <tr>
                           <td style={{width: '15%'}}>Address:</td>
                           {!updateAddress &&
                              <>
                                <td>
                                {userContext.user.address?.replace(/(?:\r\n|\r|\n)/g, '<br />').split('<br />').map((item: string, index: number) =>{
                                    return (
                                        <Fragment key={index}>
                                        {item}<br />
                                        </Fragment >
                                    )
                                })}    
                                </td>
                                <td>
                                   <button className="float-right button button-right" onClick={() => {updateAddressInit();}}>Update</button>
                                </td>
                             </>
                           }
                           {updateAddress &&
                              <>
                                <td>
                                   <textarea value={address} style={{lineHeight:'1.25rem'}} onChange={(e) => setAddress(e.target.value.replace(/<\/?[^>]*>/g, ""))} ref={addressEl} />
                                   <div className="mark" style={{color: 'red'}}>{addresserr}</div>
                                </td>
                                <td>
                                   {address.trim() !== userContext.user.address &&
                                   <>
                                   <button className="float-right button button-right" onClick={() => {updateAddressReset();}}>Reset</button>
                                   <button className="float-right button button-right" onClick={submitAddressUpdate}>Go Update</button>
                                   </>
                                   } 
                                   
                               </td>
                             </>
                           }
                       </tr>
                       {userContext.user.usertype as number < 2 &&
                        
                        <tr>
                        <td style={{width: '15%'}}>Intend to list your restaurant in this app:</td>
                        {!updateTobeOwner &&
                           <>
                             <td>
                               {userContext.user.tobeowner ? 'Yes': 'No'} 
                             </td>
                             <td>
                                <button className="float-right button button-right" onClick={() => {updateTobeOwnerInit();}}>Update</button>
                             </td>
                          </>
                        }
                        {updateTobeOwner &&
                           <>
                             <td>
                                <div style={{display: 'flex'}}>
                                   <div className={deliveryStyle.radio_element} onClick={() => {if (tobeowner) {setTobeOwner(false)}}}>
                                       <span className="material-icons">{tobeowner ? 'radio_button_unchecked': 'radio_button_checked'}</span>&nbsp;No
                                   </div>
                                   <div className={deliveryStyle.radio_element} onClick={() => {if (!tobeowner) {setTobeOwner(true)}}}>
                                       <span className="material-icons">{tobeowner ? 'radio_button_checked': 'radio_button_unchecked'}</span>&nbsp;Yes
                                   </div>
                                </div>     
                                <div className="mark" style={{color: 'red'}}>{tobeownererr}</div>
                             </td>
                             <td>
                                {tobeowner !== userContext.user.tobeowner && 
                                <>
                                <button className="float-right button button-right" onClick={() => {updateTobeOwnerReset();}}>Reset</button>
                                <button className="float-right button button-right" onClick={submitTobeOwnerUpdate}>Go Update</button>
                                </>
                                }
                                
                            </td>
                          </>
                        }
                    </tr>
                    }
                    <tr>
                        <td style={{width: '15%'}}>User Type:</td>
                        <td>{getUserTypeDescr(userContext.user.usertype as number)}</td>
                        <td></td>
                    </tr>
                   </tbody>
                </table> 
           }
           {inPost &&
               <div className={loaderStyles.loadermodal}>
                    <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
               </div>
           }
        </div>
    );
}

export default PersonalEdit;