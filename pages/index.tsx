import { useEffect } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import db from '@/lib/firestoreAdmin';
import store from 'store2';
import MainPage from '@/components/main';
import HomeContent from '@/components/homecontent';
import { ShopDataType } from '@/lib/types';

export const getStaticProps: GetStaticProps = async () => {
  const shopListData: ShopDataType[] = [];
  const snapshot = await db.collection('restaurants').where('onboard', '==', true).orderBy('created','desc').get();
  snapshot.forEach(doc => {
    shopListData.push({id: doc.id, ...doc.data()} as ShopDataType);
  });
  return {
      props: { shopListData },
      revalidate: 60 * 60 * 3
      //revalidate every 3 hours
  }    
}

interface PropsType {
  shopListData: ShopDataType[];
}

export default function Home({shopListData}: PropsType) {
  const router = useRouter()
  const { asuser } = router.query;

  useEffect(() => {
    const shopListStore = JSON.parse(store('shopliststore'));
    const currTime = Math.round(new Date().getTime() / 1000);
    if (shopListStore && currTime < (shopListStore.logintime + 60 * 60 * 3)){
       return;
    }
    const shopListStoreSave = {logintime: Math.round(new Date().getTime() / 1000), shopListData}
    store('shopliststore', JSON.stringify(shopListStoreSave));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  
  return(
    <MainPage asUserForOwner={asuser ? true: false}>
      <HomeContent shopListData={shopListData} />
    </MainPage>    
  );
}

