import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, OrderShopsElm, NoAuthorization} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<OrderShopsElm[] | NoAuthorization>) {
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
 
        const orderShops: OrderShopsElm[] = [];
        const snapshot = await db.collection('mealdelivery').doc(userId).collection('ordershops').get();   
        snapshot.forEach(doc => {
            orderShops.push({id: doc.id, ... doc.data()} as OrderShopsElm);
        });   
    
        res.status(200).json(orderShops);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}
