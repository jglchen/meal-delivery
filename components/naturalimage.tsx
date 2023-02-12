import Image, {ImageProps} from 'next/image';
import { useState } from 'react';


const NaturalImage = (props: ImageProps) => {
    const [ratio, setRatio] = useState(16/9); // default to 16:9
    let {width, ...others} = props;
    width = typeof width !== "undefined" ? width: 256;
  
    return (
      <Image
        {...others}
        alt="not found"
        // set the dimension (affected by layout)
        width={width}
        height={(width as number) / ratio}
        layout="fixed" // you can use "responsive", "fill" or the default "intrinsic"
        onLoadingComplete={({ naturalWidth, naturalHeight }) => 
          setRatio(naturalWidth / naturalHeight)
        }
      />
    )
}
  
export default NaturalImage;
