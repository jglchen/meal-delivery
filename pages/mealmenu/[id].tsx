import { GetStaticProps, GetStaticPaths } from 'next';
import db from '@/lib/firestoreAdmin';
import MainPage from '@/components/main';
import MenuDisplay from '@/components/mealmenu';
import {ShopDataType, MealDataType} from '@/lib/types';

export const getStaticPaths: GetStaticPaths = async () => {
  const shopIdList: string[] = [];
  const snapshot = await db.collection('restaurants').where('onboard', '==', true).get();
  snapshot.forEach(doc => {
    shopIdList.push(doc.id);
  });
  const paths = shopIdList.map(item => {
     return {
        params: {id: item}
     }
  });
  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let shopData: ShopDataType | null = null;
  const doc = await db.collection('restaurants').doc(params?.id as string).get();
  if (doc.exists) {
     shopData = {id: doc.id, ...doc.data()} as ShopDataType;
  }  
  const mealList: MealDataType[] = [];
  const snapshot = await db.collection('restaurants').doc(params?.id as string).collection('mealmenu').orderBy('created','desc').get();
  snapshot.forEach(doc => {
     mealList.push({id: doc.id, ...doc.data()} as MealDataType);
  });
  const menuData = {shopData, mealList}
  
  return {
    props: { menuData },
    revalidate: 60 * 60 * 6
    //revalidate every 6 hours
  }    
}

interface PropsType {
   menuData : {
     shopData: ShopDataType | null;
     mealList: MealDataType[];
   }
}

export default function MealMenu({ menuData }: PropsType) {
  return(
    <MainPage>
      <MenuDisplay menuData={menuData} />
    </MainPage>    
  );
}    