import { useState, useRef, useContext } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContext} from './Context';
import { UserContextType, ShopDataType} from '@/lib/types';

interface PropsType {
    shopData: ShopDataType;
    updateShopData: (shop: ShopDataType) => void;
    closeModal: () => void;
}

function ShopEdit({shopData, updateShopData, closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [shopName, setShopName] = useState(shopData.shopname);
    const shopNameEl = useRef<HTMLInputElement | null>(null);
    const [foodSupply, setFoodSupply] = useState(shopData.foodsupply);
    const foodSupplyEl = useRef<HTMLTextAreaElement | null>(null);
    const [shopnameerr, setShopNameErr] = useState('');
    const [foodsupplyerr, setFoodSupplyErr] = useState('');
    const [inPost, setInPost] = useState(false);

    function resetErrMsg(){
        setShopNameErr('');
        setFoodSupplyErr('');
    }
      
    async function submitFormData() {
        resetErrMsg();
        //Check if Name of Restaurant is filled
        if (!shopName.trim()){
          setShopName(prevState => prevState.trim())
          setShopNameErr("Please type your name of restaurant, this field is required!");
          shopNameEl.current?.focus();
          return;
        }
        //Check if Food Supply Description is filled
        if (!foodSupply.trim()){
          setFoodSupply(prevState => prevState.trim())
          setFoodSupplyErr("Please type your food supply description, this field is required!");
          foodSupplyEl.current?.focus();
          return;
        }
 
        const updateObj = {shopname: shopName, foodsupply: foodSupply};
        const {encryptStorage} = await import('@/lib/encryptStorage');
        const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
        setInPost(true);
        try {
            // Send request to our api route
            const { data } = await axios.post('/api/editshop', {shopId: shopData.id,  ...updateObj}, { headers: headers });
            setInPost(false);
            if (data.no_authorization){
               setShopNameErr("No authorization to upload data.");
               return;
            }
            updateShopData({...shopData, ...updateObj})
            closeModal();
        }catch(err){
            setInPost(false);
            setShopNameErr('Failed to upload data to database!');
        }
    }

    function resetForm(){
        setShopName(shopData.shopname);
        setShopNameErr('');
        setFoodSupply(shopData.foodsupply);
        setFoodSupplyErr('');
    }

    return (userContext &&
        <div className={deliveryStyle.container}>
          <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
             Edit {shopData.shopname} Fundamental Data
             <Tooltip title="Close" arrow>
                <div className="float-right" style={{cursor: 'pointer'}} onClick={() => closeModal()}>
                   <span className="material-icons">close</span>
                </div>
             </Tooltip>
          </div>
          <div className={deliveryStyle.container_body}>
              <div className={deliveryStyle.item}>
               <input
                  type="text"
                  name="shopname"
                  value={shopName}
                  placeholder="Name of Restaurant"
                  onChange={(e) => setShopName(e.target.value.replace(/<\/?[^>]*>/g, ""))}
                  ref={shopNameEl}
               />
               <div className="mark" style={{color: 'red'}}>{shopnameerr}</div>
             </div>
             <div className={deliveryStyle.item}>
               <textarea
                  name="foodsupply"  
                  value={foodSupply}
                  placeholder="Food Supply"
                  style={{lineHeight:'1.25rem'}}
                  onChange={(e) => setFoodSupply(e.target.value.replace(/<\/?[^>]*>/g, ""))} 
                  ref={foodSupplyEl}   
               />
               <div className="mark" style={{color: 'red'}}>{foodsupplyerr}</div>
             </div>
             <div className={deliveryStyle.item}>
                <button className="button" onClick={() => submitFormData()}>Go Update</button>
                <button className="button" onClick={() => resetForm()}>Reset</button>
             </div>    
          </div>
          {inPost &&
              <div className={loaderStyles.loadermodal}>
                <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
              </div>
          }
        </div>  
    );
}    

export default ShopEdit;
