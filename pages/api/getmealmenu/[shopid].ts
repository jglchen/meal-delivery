import db from '@/lib/firestoreAdmin';
import {MealDataType} from '@/lib/types';
import { pageSizeMeals } from '@/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<MealDataType[]>) {
    try {         
        let pageIndex: number;
        const {shopid, page} = req.query;
        if (!page){
            pageIndex = 0;
        }else{
            pageIndex = parseInt(page as string);
        }
        const limitNum = (pageIndex+1)*pageSizeMeals; 

        const result: any = [];
        const snapshot = await db.collection('restaurants').doc(shopid as string).collection('mealmenu').orderBy('created','desc').limit(limitNum).get();
        snapshot.forEach(doc => {
            const dataObj = {id: doc.id, ...doc.data()} as MealDataType;
            result.push(dataObj);
        });
        if (pageIndex > 0){
            res.status(200).json(result.slice(pageIndex*pageSizeMeals, limitNum));           
        }else{
            res.status(200).json(result);
        }
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                           