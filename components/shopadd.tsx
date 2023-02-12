import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import store from 'store2';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContext} from './Context';
import NaturalImage from './naturalimage';
import { UserContextType, ImgDimensionType} from '@/lib/types';
import { maxImageWidth } from '@/lib/utils';

interface PropsType {
    closeModal: () => void;
}

function ShopAdd({closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [shopName, setShopName] = useState('');
    const shopNameEl = useRef<HTMLInputElement | null>(null);
    const [foodSupply, setFoodSupply] = useState('');
    const foodSupplyEl = useRef<HTMLTextAreaElement | null>(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [imgDimension, setImgDimension] = useState<ImgDimensionType | null>(null);
    const inputImageRef = useRef<HTMLInputElement | null>(null);
    const [shopnameerr, setShopNameErr] = useState('');
    const [foodsupplyerr, setFoodSupplyErr] = useState('');
    const [selectedimgerr, setSelectImgErr] = useState('');
    const [imgWidth, setImgWidth] = useState(0);
    const [inPost, setInPost] = useState(false);

    useEffect(() => {
      const width = parseInt(getComputedStyle(shopNameEl.current as HTMLInputElement).width);
      setImgWidth(width-16 > 0 ? (width-16): 0);
    },[]);

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
       //Check if width of image to be uploaded is larger than maxImageWidth
       if (imgDimension?.width as number >  maxImageWidth){
          return;
       }

       const formData = new FormData();

       // Add images to FormData
       if (inputImageRef.current?.files?.length) {
          formData.append('file', inputImageRef.current.files[0]);
       }
  
       formData.append('shopname', shopName);
       formData.append('foodsupply', foodSupply);

       const {encryptStorage} = await import('@/lib/encryptStorage');
       const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
       setInPost(true);
       try {
         
         // Send request to our api route
         const { data } = await axios.post('/api/addshop', formData, { headers: headers });
         setInPost(false);
         if (data.no_authorization){
            setShopNameErr("No authorization to upload data.");
            shopNameEl.current?.focus();
            return;
         }
         //Further process on data returned-----//
         let {shopid} = userContext.user;
         shopid = shopid || [];
         shopid.push({id: data.id, shopname: data.shopname, onboard: false});
         const user = {...userContext.user, shopid};
         userContext.user = user;
         store('user', JSON.stringify(user));
         closeModal();
       }catch(err){
         setInPost(false);
         setShopNameErr('Failed to upload data to database!');
       }
    }

    function resetForm(){
      setShopName('');
      setShopNameErr('');
      setFoodSupply('');
      setFoodSupplyErr('');
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
             Add My Restaurant
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
             <label htmlFor="profileimage" className={deliveryStyle.label_button}>
               Restaurant Profile Image <span className="material-icons" style={{verticalAlign: 'middle'}}>image</span>
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
                <button className="button" onClick={() => submitFormData()}>Add Restaurant</button>
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


export default ShopAdd;
