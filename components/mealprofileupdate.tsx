import { useState, useEffect, useRef, useContext, FormEvent } from 'react';
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import 'material-icons/iconfont/material-icons.css';
import deliveryStyle from '@/styles/delivery.module.css';
import loaderStyles from '@/styles/loader.module.css';
import {UserContext} from './Context';
import NaturalImage from './naturalimage';
import DisplayImage from './displayimage';
import { UserContextType, ImgDimensionType, MealDataType} from '@/lib/types';
import { maxImageWidth, pageSizeImages } from '@/lib/utils';

interface PropsType {
    shopId: string;
    mealData: MealDataType;
    updateMenuOnMealEdit: (meal: MealDataType) => void;
    closeModal: () => void;
}

function MealProfileUpdate({shopId, mealData, updateMenuOnMealEdit, closeModal}: PropsType){
    const userContext: UserContextType = useContext(UserContext);
    const [selectUploaded, setSelectUploaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [imgDimension, setImgDimension] = useState<ImgDimensionType | null>(null);
    const profileLabelRef = useRef<HTMLLabelElement | null>(null);
    const inputImageRef = useRef<HTMLInputElement | null>(null);
    const [selectedimgerr, setSelectImgErr] = useState('');
    const [checkedimgerr, setCheckImgErr] = useState('');
    const [imgWidth, setImgWidth] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [checkedImage, setCheckedImage] = useState('');
    const [imageList, setImageList] = useState<string[]>([]);
    const [imageFetched, setImageFetched] = useState(false);
    const [inPost, setInPost] = useState(false);

    useEffect(() => {
       if (!selectUploaded && !imgWidth){
          const width = parseInt(getComputedStyle(profileLabelRef.current as HTMLLabelElement).width);
          setImgWidth(width-16 > 0 ? (width-16): 0);
       }
       if (selectUploaded && imageList.length === 0 && userContext){
          fetchImageData(pageIndex);
       }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[selectUploaded,userContext]);
    
    async function fetchImageData(pageIdx: number){
      if (pageIdx*pageSizeImages < imageList.length ){
         return;
      }
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      try {
         const { data } = await axios.get(`/api/getuseruploadedimages?page=${pageIdx}`, { headers: headers });
         setImageList(prevState => prevState.concat(data));
         setImageFetched(true);
      }catch(e){
         //console.log(e);
      }
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
    
    async function submitFormData() {

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
      formData.append('id', mealData.id);

      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      setInPost(true);
      try {
         // Send request to our api route
         const { data } = await axios.post('/api/updatemealprofile', formData, { headers: headers });
         setInPost(false);
         if (data.no_authorization){
            setSelectImgErr("No authorization to upload data.");
            profileLabelRef.current?.focus();
            return;
         }
         const meal = {...mealData, profileimage: data.profileimage};
         updateMenuOnMealEdit(meal);
         closeModal();
      }catch(err){
         setInPost(false);
         setSelectImgErr('Failed to upload data to database!');
       }
    }

    function resetForm(){
      if (inputImageRef.current?.files?.length) {
         inputImageRef.current.value = '';
         setSelectedImage('');
         setImgDimension(null);
         setSelectImgErr('');
      }
    }

    async function submitCheckedImage() {
      setCheckImgErr('');
          
      //Check if image is selected as meal profile
      if (!checkedImage){
         setCheckImgErr("Please select an image to be the meal profile, this is required!");
         return;
      }
      
      const {encryptStorage} = await import('@/lib/encryptStorage');
      const headers = { authorization: `Bearer ${encryptStorage.getItem('token')}` };
      const updateObj = {profileimage: checkedImage};
      setInPost(true);
      try {
         // Send request to our api route
         const { data } = await axios.post('/api/editmeal', {shopId, id: mealData.id, ...updateObj}, { headers: headers });
         setInPost(false);
         if (data.no_authorization){
            setCheckImgErr("No authorization to upload data.");
            return;
         }
         updateMenuOnMealEdit({...mealData, ...updateObj})
         closeModal();
      }catch(err){
         setInPost(false);
         setCheckImgErr('Failed to upload data to database!');
      }
   }

    return (userContext && 
        <div className={deliveryStyle.container}>
          <div className={`${deliveryStyle.container_head} ${'text-center'}`}>
             Profile Update for {mealData.mealname}
             <Tooltip title="Close" arrow>
                <div className="float-right" style={{cursor: 'pointer'}} onClick={() => closeModal()}>
                   <span className="material-icons">close</span>
                </div>
             </Tooltip>
          </div>
          <div className={deliveryStyle.container_body}>
            <div className={`${deliveryStyle.item} clearfix`}>
              <div className={`${deliveryStyle.radio_element} float-left`} style={{marginRight: '2.0rem'}} onClick={() => {if (selectUploaded){setSelectUploaded(false)}}}>
                 <span className="material-icons">{selectUploaded ? 'radio_button_unchecked': 'radio_button_checked'}</span>&nbsp;&nbsp;Upload a new image
              </div>
              <div className={`${deliveryStyle.radio_element} float-left`} onClick={() => {if (!selectUploaded){setSelectUploaded(true)}}}>
                 <span className="material-icons">{selectUploaded ? 'radio_button_checked': 'radio_button_unchecked'}</span>&nbsp;&nbsp;Select from uploaded images
              </div>
            </div>
          {selectUploaded &&
            <>
            {imageList.length > 0 &&
            <>
            <div className={deliveryStyle.flex_box}>
              {imageList.map((item:string) => 
                 <div className={deliveryStyle.image_container} 
                   style={checkedImage === item ? {}:{cursor: 'pointer'}} 
                   key={item}
                   onClick={() => {if(checkedImage !== item){setCheckedImage(item)}}}
                   >
                   <DisplayImage alt="" src={item}  width={Math.floor(imgWidth/4)}   />
                   <div className={deliveryStyle.top_right}>
                     <span className="material-icons">{checkedImage === item ? 'check_box': 'check_box_outline_blank'}</span>
                 </div>
                 </div> 
              )}
            </div>
            <div className="mark" style={{color: 'red'}}>{checkedimgerr}</div>
            {pageSizeImages*(pageIndex+1) === imageList.length &&
            <div>
                <button className="muted-button" onClick={() => {const pageIdx = pageIndex + 1; setPageIndex(pageIdx); fetchImageData(pageIdx); }}>Load More Images  &raquo;</button>
            </div>
            }
            <div>
                <button className="button" onClick={() => submitCheckedImage()}>Set Checked Image As the Meal Profile</button>
            </div>
            </> 
            }
            {imageList.length === 0 &&
            <div> 
               {imageFetched &&
                 <h5>You have no images uploaded</h5>
               }
               {!imageFetched &&
                 <h5>Please wait...Data is loading.</h5>
               }
            </div>   
            } 
            </>
          }
          {!selectUploaded &&
            <>
            <div className={deliveryStyle.item}>
              <label htmlFor="profileimage" className={deliveryStyle.label_button} ref={profileLabelRef}>
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
            </div>
            {selectedImage &&
               <>
               <NaturalImage alt="" src={selectedImage} width={imgWidth} />
               <div className="mark" style={{color: 'red'}}>{selectedimgerr}</div>
               </>
            }
            <div className={deliveryStyle.item}>
               <button className="button" onClick={() => submitFormData()}>Upload Profile</button>
               <button className="button" onClick={() => resetForm()}>Reset</button>
            </div>    
            </>
          } 
          </div>
          {inPost &&
              <div className={loaderStyles.loadermodal}>
                <div className={`${loaderStyles.loader} ${loaderStyles.div_on_center}`} />
              </div>
          }
        </div>
        
    );
}

export default MealProfileUpdate;
