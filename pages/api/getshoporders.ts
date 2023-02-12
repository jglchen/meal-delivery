import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, MealOrderType, NoAuthorization} from '@/lib/types';
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

        const {shopId} = req.query;

        const doc = await db.collection('restaurants').doc(shopId as string).get();
        if (!doc.exists) {
            res.status(200).json({no_authorization: 1});
            return;  
        } 
        if (doc.data()?.owner !== userId){
            res.status(200).json({no_authorization: 1});
            return;  
        }
 
        const orderList: MealOrderType[] = [];
        const snapshot = await db.collection('restaurants').doc(shopId as string).collection('mealorders').where('active', '==', true).orderBy('created', 'desc').get();
        snapshot.forEach(doc => {
            orderList.push({id: doc.id, ...doc.data()} as MealOrderType);
        });
        res.status(200).json(orderList);

    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}    