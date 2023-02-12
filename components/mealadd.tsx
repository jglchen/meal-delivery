import { useState, useEffect, useRef, useContext, FormEvent } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContext} from './Context';
import NaturalImage from './naturalimage';
import { UserContextType, ImgDimensionType, MealDataType} from '@/lib/types';
import { maxImageWidth } from '@/lib/utils';

interface PropsType {
    shopId: string;
    shopName: string;
    updateMealMenu: (meal: MealDataType) => void;
    closeModal: () => void;
}

function MealAdd({shopId, shopName, updateMealMenu, closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [mealName, setMealName] = useState('');
    const mealNameEl = useRef<HTMLInputElement | null>(null);
    const [mealDescr, setMealDescr] = useState('');
    const mealDescrEl = useRef<HTMLTextAreaElement | null>(null);
    const [mealPrice, setMealPrice] = useState('');
    const mealPriceEl = useRef<HTMLInputElement | null>(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [imgDimension, setImgDimension] = useState<ImgDimensionType | null>(null);
    const inputImageRef = useRef<HTMLInputElement | null>(null);
    const [mealnameerr, setMealNameErr] = useState('');
    const [mealdescrerr, setMealDescrErr] = useState('');
    const [mealpriceerr, setMealPriceErr] = useState('');
    const [selectedimgerr, setSelectImgErr] = useState('');
    const [imgWidth, setImgWidth] = useState(0);
    const [inPost, setInPost] = useState(false);

    useEffect(() => {
      const width = parseInt(getComputedStyle(mealNameEl.current as HTMLInputElement).width);
      setImgWidth(width-16 > 0 ? (width-16): 0);
    },[]);
    
    function handleMealPriceInput(e: FormEvent<HTMLInputElement>){
      let { value } = e.currentTarget;
      value = value.replace(/<\/?[^>]*>/g, "");
      if (isNaN(Number(value))){
         return;
      }
      setMealPrice(value);
    }
    
    async function changeSelectedImage(){
      if (!inputImageRef.current?.files?.length) {
         setSelectedImage('');
         setImgDimension(null);
         setSelectImgErr('');
         return;
      }

      const imageUrl = URL.createObjectURL(inputImageRef.current.files[0]);
      setSelectedImage(imageUrl);
      try {
         const result = await getImageDimension(imageUrl) as ImgDimensionType;
         setImgDimension(result);
         let imgSizeRemark = `width: ${result.width}, height: ${result.height}.`;
         if (result.width > maxImageWidth){
            imgSizeRemark += ` The app will not accept images with a width larger than ${maxImageWidth}px, please resize the image before uploading.`;
         }
         setSelectImgErr(imgSizeRemark);
      }catch(err){
         console.error(err);
      }
    }
    
    const getImageDimension = (inputUrl: string) => {
      const img = new Image();
 
      return new Promise((resolve, reject) => {
         img.onerror = () => {
           img.remove();
           reject(new DOMException("Problem parsing input file."));
         };
 
         img.onload = () => {
           const result: ImgDimensionType = {width: img.width, height: img.height};
           img.remove();
           resolve(result);
         }
         img.src = inputUrl;
      }); 
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

      //Check if width of image to be uploaded is larger than maxImageWidth
      if (imgDimension?.width as number >  maxImageWidth){
         return;
      }

      const formData = new FormData();

      // Add images to FormData
      if (inputImageRef.current?.files?.length) {
         formData.append('file', inputImageRef.current.files[0]);
      }

      formData.append('shopid', shopId);
      formData.append('mealname', mealName);
      formData.append('mealdescr', mealDescr);
      formData.append('unitprice', mealPrice);

      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      setInPost(true);
      try {
         // Send request to our api route
         const { data } = await axios.post('/api/addmeal', formData, { headers: headers });
         setInPost(false);
         if (data.no_authorization){
            setMealNameErr("No authorization to upload data.");
            mealNameEl.current?.focus();
            return;
         }
         updateMealMenu(data);
         closeModal();
      }catch(err){
         setInPost(false);
         setMealNameErr('Failed to upload data to database!');
      }
   
    }

    function resetForm(){
      setMealName('');
      setMealNameErr('');
      setMealDescr('');
      setMealDescrErr('');
      setMealPrice('');
      setMealPriceErr('');
      if (inputImageRef.current?.files?.length) {
         inputImageRef.current.value = '';
         setSelectedImage('');
         setImgDimension(null);
         setSelectImgErr('');
      }
    }

    return (userContext &&
        <div className={deliveryStyle.container}>
          <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
             Add Meal To {shopName}
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
             <label htmlFor="profileimage" className={deliveryStyle.label_button}>
               Meal Profile Image <span className="material-icons" style={{verticalAlign: 'middle'}}>image</span>
               <input
                     type="file"
                     name="profileimage"
                     id="profileimage"
                     accept="image/*"
                     onChange={changeSelectedImage}
                     ref={inputImageRef}
                     style={{display:'none'}}
                  />
             </label>
             {selectedImage &&
                <>
                <NaturalImage alt="" src={selectedImage} width={imgWidth} />
                <div className="mark" style={{color: 'red'}}>{selectedimgerr}</div>
                </>
             }
             <div className={deliveryStyle.item}>
                <button className="button" onClick={() => submitFormData()}>Add Meal</button>
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


export default MealAdd;

