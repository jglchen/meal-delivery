import Image, {ImageProps} from 'next/image';
import axios from 'axios';
import useSWR from 'swr';

const DisplayImage = (props: ImageProps) => {
    const fetcher = (url: string) => axios.get(url).then(res => res.data);
    let {width, height, src: filename, ...others} = props;
    width = typeof width !== "undefined" ? width: 128;
    height = typeof height !== "undefined" ? height: width;
    const objectFit = 'cover';
    const { data: imageData, mutate: imageMutate } = useSWR(`/api/getimage/${filename ? filename: 'meal-icon.png'}`, fetcher);

    function getImageSource(imageData: any){
       if (imageData.filename){
          return imageData.filename; 
       }
       if (imageData.no_data){
        return '/images/meal-icon.png'; 
       }
       return `data:${imageData.mimetype};base64,${imageData.base64}`;
    }

    if (!imageData){
       return(
         <div>Please wait. Data is loading....</div> 
       );
    }

    return (
       <Image 
         {...others}
         alt="not found"
         src={getImageSource(imageData)}
         width={width}
         height={height}
         style={{objectFit}}
       />

    );    
}

export default DisplayImage;
