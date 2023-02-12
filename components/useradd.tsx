import { useState, useRef, useContext, FormEvent } from 'react';
import validator from 'email-validator';
import passwordValidator from 'password-validator';
import axios from 'axios';
import store from 'store2';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContext} from '@/components/Context';
import {UserContextType, UserAddType} from '@/lib/types';

interface PropsType {
   signUpIn: (act: number, em?: string) => void;
}

function UserAdd(props: PropsType){
    const userContext: UserContextType  = useContext(UserContext);
    const initialState = {
        name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        usertype: 1,
        tobeowner: false,
    }
    const [user, setUser] = useState<UserAddType>(initialState);
    const [password2, setPassWd2] = useState('');
    const [nameerr, setNameErr] = useState('');
    const nameEl = useRef<HTMLInputElement | null>(null);
    const [emailerr, setEmailErr] = useState('');
    const emailEl = useRef<HTMLInputElement | null>(null);
    const [passwderr, setPassWdErr] = useState('');
    const passwdEl = useRef<HTMLInputElement | null>(null);
    const passwd2El = useRef<HTMLInputElement | null>(null);
    const exceptArr: string[] =['name', 'phone', 'address'];
    const [inPost, setInPost] = useState(false);
    
    function handleChange(e: FormEvent<HTMLInputElement | HTMLTextAreaElement>){
        let { value, name } = e.currentTarget;
        //Remove all the markups to prevent Cross-site Scripting attacks
        value = value.replace(/<\/?[^>]*>/g, "");
        if (!exceptArr.includes(name)){
            value = value.trim();
        }
        setUser(prevState => ({ ...prevState, [name]: value }));
    }
 
    function handlePassWd2Change(e: FormEvent<HTMLInputElement>){
        let passwd2 = e.currentTarget.value;
        //Remove all the markups to prevent Cross-site Scripting attacks
        passwd2 = passwd2.trim().replace(/<\/?[^>]*>/g, "");
        setPassWd2(passwd2);
    }

    function changeTobeOwner(boo: boolean){
       setUser(prevState => ({ ...prevState, tobeowner: boo }));
    }
 
    function resetErrMsg(){
       setNameErr('');
       setEmailErr('');
       setPassWdErr('');
    }
    
    async function submitForm(){
       //Reset all the err messages
       resetErrMsg();	  
       //Check if Name is filled
       if (!user.name.trim()){
          setUser(prevState => ({ ...prevState, name: user.name.trim() })) 
          setNameErr("Please type your name, this field is required!");
          nameEl.current?.focus();
          return;
       }
       //Check if Email is filled
       if (!user.email){
          setEmailErr("Please type your email, this field is required!");
          emailEl.current?.focus();
          return;
       }
       //Validate the email
       if (!validator.validate(user.email)){
          setEmailErr("This email is not validated OK, please enter a legal email.");
          emailEl.current?.focus();
          return;
       }
       //Check if Passwd is filled
       if (!user.password || !password2){
          setPassWdErr("Please type your password, this field is required!");
          if (!user.password){
             passwdEl.current?.focus();
          }else{
             passwd2El.current?.focus();
          }
          return;
       }
       //Check the passwords typed in the two fields are matched
       if (user.password != password2){
           setPassWdErr("Please retype your passwords, the passwords you typed in the two fields are not matched!");
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
       if (!schema.validate(user.password)){
          setPassWdErr("The password you typed is not enough secured, please retype a new one. The password must have both uppercase and lowercase letters as well as minimum 2 digits.");
          passwdEl.current?.focus();
          return;
       }
       
       setInPost(true);
       try {
         const submitRes = await axios.post('/api/adduser', {...user, name: user.name.trim(), phone: user.phone.trim(), address: user.address.trim()});
         setInPost(false);
         const {data} = submitRes;
         if (data.duplicate_email){
            setEmailErr("This email has been registered as a user, please use a different email to sign up.");
            emailEl.current?.focus();
            return;
         }
         const {token, ...others} = data;
         const {encryptStorage} = await import('@/lib/encryptStorage');
         
         const userData = {...others, logintime: Math.round(new Date().getTime() / 1000)};
         store('user', JSON.stringify(userData));
         userContext.login(userData);
         encryptStorage.setItem('token', token);
         setUser(initialState);
         setPassWd2('');
       }catch(err){
         setInPost(false);
         setNameErr('Failed to upload data to database!');
       }
       
    }

    function resetForm(){
      setUser(initialState);
      setPassWd2('');
      resetErrMsg();
    }

    return (userContext &&
        <div className={loaderStyles.container}>
          <h2 className="text-center">Please Register</h2>
          <form>
          <div className="mark" style={{color: 'red'}}>{nameerr}</div>
          <input
              type="text"
              name="name"
              value={user.name}
              placeholder="Name*"
              ref={nameEl}
              onChange={handleChange}    
               />
          <div className="mark" style={{color: 'red'}}>{emailerr}</div>
          <input
              type="text"
              name="email"
              value={user.email}
              placeholder="Email*"
              ref={emailEl}
              onChange={handleChange}    
               />
          <div className="mark" style={{color: 'red'}}>{passwderr}</div>
          <input
              type="password"
              name="password"
              value={user.password}
              placeholder="Password*"
              ref={passwdEl}
              onChange={handleChange}    
               />
          <input
              type="password"
              name="password2"
              value={password2}
              placeholder="Please type password again*"
              ref={passwd2El}
              onChange={handlePassWd2Change}    
               />
          <input
              type="text"
              name="phone"
              value={user.phone}
              placeholder="Phone"
              onChange={handleChange}    
               />
          <textarea
               name="address"  
               value={user.address}
               placeholder="Address"
               style={{lineHeight:'1.25rem'}}
               onChange={handleChange}    
               />
          <div style={{display: 'flex', padding: '0 0 0.5rem 0'}}>
            Intend to list your restaurant in this app for delivery: 
            <div className={deliveryStyle.radio_element} onClick={() => {if (user.tobeowner) {changeTobeOwner(false)}}}>
                <span className="material-icons">{user.tobeowner ? 'radio_button_unchecked': 'radio_button_checked'}</span>&nbsp;No
             </div>
             <div className={deliveryStyle.radio_element} onClick={() => {if (!user.tobeowner) {changeTobeOwner(true)}}}>
                <span className="material-icons">{user.tobeowner ? 'radio_button_checked': 'radio_button_unchecked'}</span>&nbsp;Yes
             </div>
          </div>     
          </form>
          <input type="button" className="button" value="Sign Up" onClick={submitForm} /> <input type="button" className="button" value="Reset" onClick={resetForm} /> {props.signUpIn && <button className="muted-button button" onClick={() => props.signUpIn(0)}>Log In</button>}
          {inPost &&
              <div className={loaderStyles.loadermodal}>
                <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
              </div>
          }
        </div>
    ); 
}

export default UserAdd;