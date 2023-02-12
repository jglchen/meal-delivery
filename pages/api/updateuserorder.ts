import db from '@/lib/firestoreAdmin';
import {firestore} from 'firebase-admin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, NoAuthorization, ProcessResult} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
const PUBLIC_CODE = process.env.NEXT_PUBLIC_PUBLIC_CODE as string;
import type { NextApiRequest, NextApiResponse } from 'next';

interface OrderUpdateData {
    shopId: string;
    id: string;
    orderstatus: number;
    statushistory: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<OrderUpdateData | NoAuthorization | ProcessResult>) {
    try {
        if (req.method === 'PUT'){
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
            const { shopId, id, statustobe, statushistory } = req.body;
            if (statustobe !== 1 && statustobe !== 5){
                res.status(200).json({no_authorization: 1});
                return;
            }
            const orderid = `${shopId}_${id}`;
            /*
            const doc = await db.collection('mealdelivery').doc(userId).collection('mealorders').doc(orderid).get();
            if (!doc.exists) {
                res.status(200).json({no_authorization: 1});
                return;
            }*/ 
            const resp =  await db.collection('mealdelivery').doc(userId).collection('mealorders').doc(orderid).update({orderstatus: statustobe, active: false}); 
            await db.collection('mealdelivery').doc(userId).collection('orderrecent').doc('orderrecent').delete();
            if (statustobe === 1){
                await db.collection('mealdelivery').doc(userId).collection('ordershops').doc(shopId).update({cancel: firestore.FieldValue.increment(1)}); 
            }
    
            statushistory.push(new Date().toISOString());
            const docOrder = await db.collection('restaurants').doc(shopId).collection('mealorders').doc(id).get();
            if (docOrder.exists){
                const newDoc = {id, ...docOrder.data(), orderstatus: statustobe, statushistory, active: false};
                const resp2 = await db.collection('restaurants').doc(shopId).collection('mealorders').doc(id).update({orderstatus: statustobe, statushistory, active: false});
                await db.collection('restaurants').doc(shopId).collection('orderrecent').doc('orderrecent').set({...newDoc, publiccode: PUBLIC_CODE});
                if (statustobe === 1){
                    await db.collection('restaurants').doc(shopId).collection('clients').doc(userId).update({cancel: firestore.FieldValue.increment(1)});
                }
            }
            res.status(200).json({shopId, id, orderstatus: statustobe, statushistory});
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}    