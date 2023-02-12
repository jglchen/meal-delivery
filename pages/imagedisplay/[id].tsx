import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import useSWR from 'swr';

export default function ImageDisplay() {
   const fetcher = (url: string) => axios.get(url).then(res => res.data);
   const router = useRouter();
   const { id } = router.query;
   const { data: imageData, mutate: imageMutate } = useSWR(`/api/getimagedata/${id}`, fetcher);

   return (
    <div className="container">
    {!imageData &&
      <h2>Please wait. Data is loading....</h2>   
    }
    {imageData && 
       <>
       {imageData.no_data && 
          <h2>No {id} Image Data found</h2>    
       }
       {imageData.id && 
          <Image alt="not found" src={`data:${imageData.mimetype};base64,${imageData.base64}`} width={imageData.width} height={imageData.height} /> 
       }
       </>    
    }
    </div>   
  );

}

