import { useState, useEffect, useRef, useContext, FormEvent } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContext} from './Context';
import { UserContextType, MealDataType} from '@/lib/types';

interface PropsType {
    shopId: string;
    mealData: MealDataType;
    updateMenuOnMealEdit: (meal: MealDataType) => void;
    closeModal: () => void;
}

function MealEdit({shopId, mealData, updateMenuOnMealEdit, closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [mealName, setMealName] = useState(mealData.mealname);
    const mealNameEl = useRef<HTMLInputElement | null>(null);
    const [mealDescr, setMealDescr] = useState(mealData.mealdescr);
    const mealDescrEl = useRef<HTMLTextAreaElement | null>(null);
    const [mealPrice, setMealPrice] = useState(mealData.unitprice+'');
    const mealPriceEl = useRef<HTMLInputElement | null>(null);
    const [mealnameerr, setMealNameErr] = useState('');
    const [mealdescrerr, setMealDescrErr] = useState('');
    const [mealpriceerr, setMealPriceErr] = useState('');
    const [inPost, setInPost] = useState(false);

    function handleMealPriceInput(e: FormEvent<HTMLInputElement>){
      let { value } = e.currentTarget;
      value = value.replace(/<\/?[^>]*>/g, "");
      if (isNaN(Number(value))){
         return;
      }
      setMealPrice(value);
    }

    function resetErrMsg(){
      setMealNameErr('');
      setMealDescrErr('');
      setMealPriceErr('');
    }
    
    async function submitFormData() {
       resetErrMsg();
       //Check if Name of Meal is filled
       if (!mealName.trim()){
         setMealName(prevState => prevState.trim())
         setMealNameErr("Please type your name of meal, this field is required!");
         mealNameEl.current?.focus();
         return;
       }
       //Check if Meal Description is filled
       if (!mealDescr.trim()){
         setMealDescr(prevState => prevState.trim())
         setMealDescrErr("Please type your meal description, this field is required!");
         mealDescrEl.current?.focus();
         return;
       }
       //Check if Meal Price is filled
       if (!mealPrice || !Number(mealPrice)){
         setMealPriceErr("Please type your meal price, this field is required!");
         mealPriceEl.current?.focus();
         return;
       }

       const updateObj = {mealname: mealName, mealdescr: mealDescr, unitprice: Number(mealPrice)};
       const {encryptStorage} = await import('@/lib/encryptStorage');
       const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
       setInPost(true);
       try {
         // Send request to our api route
         const { data } = await axios.post('/api/editmeal', {shopId, id: mealData.id, ...updateObj}, { headers: headers });
         setInPost(false);
         if (data.no_authorization){
            setMealNameErr("No authorization to upload data.");
            return;
         }
         updateMenuOnMealEdit({...mealData, ...updateObj})
         closeModal();
       }catch(err){
         setInPost(false);
         setMealNameErr('Failed to upload data to database!');
       }
    }

    function resetForm(){
      setMealName(mealData.mealname);
      setMealNameErr('');
      setMealDescr(mealData.mealdescr);
      setMealDescrErr('');
      setMealPrice(mealData.unitprice+'');
      setMealPriceErr('');
    }

    return (userContext &&
        <div className={deliveryStyle.container}>
          <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
             Edit Meal As Below
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
                  name="mealname"
                  value={mealName}
                  placeholder="Name of Meal"
                  onChange={(e) => setMealName(e.target.value.replace(/<\/?[^>]*>/g, ""))}
                  ref={mealNameEl}
               />
               <div className="mark" style={{color: 'red'}}>{mealnameerr}</div>
             </div>
             <div className={deliveryStyle.item}>
               <textarea
                  name="mealdescr"  
                  value={mealDescr}
                  placeholder="Meal Description"
                  style={{lineHeight:'1.25rem'}}
                  onChange={(e) => setMealDescr(e.target.value.replace(/<\/?[^>]*>/g, ""))}
                  ref={mealDescrEl}    
               />
               <div className="mark" style={{color: 'red'}}>{mealdescrerr}</div>
             </div>
             <div className={deliveryStyle.item}>
               <input
                  type="text"
                  name="unitprice"
                  value={mealPrice}
                  placeholder="Meal Price"
                  onChange={handleMealPriceInput}
                  ref={mealPriceEl}
               />
               <div className="mark" style={{color: 'red'}}>{mealpriceerr}</div>
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


export default MealEdit;
