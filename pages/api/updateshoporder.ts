import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, NoAuthorization, ProcessResult} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
const PUBLIC_CODE = process.env.NEXT_PUBLIC_PUBLIC_CODE as string;
import type { NextApiRequest, NextApiResponse } from 'next';

interface OrderUpdateData {
    shopId: string;
    id: string;
    userId?: string;
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
            const { shopId, id, userId: userid, statustobe, statushistory } = req.body;
            if (statustobe !== 2 && statustobe !== 3 && statustobe !== 4){
                res.status(200).json({no_authorization: 1});
                return;
            }
            const doc = await db.collection('restaurants').doc(shopId).get();
            if (!doc.exists) {
                res.status(200).json({no_authorization: 1});
                return;
            }
            if (doc.data()?.owner !== userId) {
                res.status(200).json({no_authorization: 1});
                return;
            }
            statushistory.push(new Date().toISOString());
            const resp = await db.collection('restaurants').doc(shopId).collection('mealorders').doc(id).update({orderstatus: statustobe, statushistory});
            
            const resp2 =  await db.collection('mealdelivery').doc(userid).collection('mealorders').doc(`${shopId}_${id}`).update({orderstatus: statustobe});
            await db.collection('mealdelivery').doc(userid).collection('orderrecent').doc('orderrecent').set({shopId, id, orderstatus: statustobe, statushistory, publiccode: PUBLIC_CODE});
             
            res.status(200).json({shopId, id, userId: userid, orderstatus: statustobe, statushistory});
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}    
