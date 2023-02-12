import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, MealOrderType, NoAuthorization, NoData} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<MealOrderType | NoAuthorization | NoData>) {
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

        const {shopId, id} = req.query;
    
        const doc = await db.collection('mealdelivery').doc(userId).collection('mealorders').doc(`${shopId}_${id}`).get();
        if (!doc.exists) {
            res.status(200).json({no_authorization: 1});
            return;  
        } 
        
        const docOrder = await db.collection('restaurants').doc(shopId as string).collection('mealorders').doc(id as string).get();
        if (!docOrder.exists) {
            res.status(200).json({no_data: 1});
            return;  
        } 
        res.status(200).json({...docOrder.data(), shopId, id} as MealOrderType);
    
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}
