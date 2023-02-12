import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, MealOrderType, NoAuthorization} from '@/lib/types';
import { pageSizeOrders } from '@/lib/utils';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<MealOrderType[] | NoAuthorization>) {
    try {         
        //Check Authorization
        const {authorization} = req.headers;
        if (!authorization){
            res.status(200).json({no_authorization: 1});
            return;
        }
        const token = authorization.replace('Bearer ', '');
        if (!token){
            res.status(200).json({no_authorization: 1});
            return;
        }
        const { userId } = jwt.verify(token, APP_SECRET) as UserJwtPayload;
        if (!userId) {
            res.status(200).json({no_authorization: 1});
            return;
        }

        let pageIndex: number;
        const {shopId, page} = req.query;
        if (!page){
            pageIndex = 0;
        }else{
            pageIndex = parseInt(page as string);
        }
        const limitNum = (pageIndex+1)*pageSizeOrders;

        let result: string[] = [];
        const snapshot = await db.collection('mealdelivery').doc(userId).collection('mealorders').where('shopId', '==', shopId).orderBy('created', 'desc').limit(limitNum).get();
        snapshot.forEach(doc => {
            const [shopid, id] = doc.id.split('_');
            result.push(id);
        });
        if (pageIndex > 0){
            result = result.slice(pageIndex*pageSizeOrders, limitNum);
        }

        const orderRecords: MealOrderType[] = [];
        for (let elm of result){
            const doc = await db.collection('restaurants').doc(shopId as string).collection('mealorders').doc(elm).get();
            if (!doc.exists) {
                return;  
            } 
            orderRecords.push({id: elm, ...doc.data()} as MealOrderType)
        }
        
        res.status(200).json(orderRecords);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}

