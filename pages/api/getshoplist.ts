import db from '@/lib/firestoreAdmin';
import {ShopDataType} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ShopDataType[]>) {
    try {         
        const shopListData: ShopDataType[] = [];
        const snapshot = await db.collection('restaurants').where('onboard', '==', true).orderBy('created','desc').get();
        snapshot.forEach(doc => {
          shopListData.push({id: doc.id, ...doc.data()} as ShopDataType);
        });
        res.status(200).json(shopListData);
    
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}        