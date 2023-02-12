import db from '@/lib/firestoreAdmin';
import {MealDataType} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<MealDataType[]>) {
    try {         
        const {shopid} = req.query;

        const mealList: MealDataType[] = [];
        const snapshot = await db.collection('restaurants').doc(shopid as string).collection('mealmenu').orderBy('created','desc').get();
        snapshot.forEach(doc => {
           mealList.push({id: doc.id, ...doc.data()} as MealDataType);
        });
        res.status(200).json(mealList);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                           