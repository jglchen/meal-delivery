import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import {UserJwtPayload, SetShopOnboardDone, UserRecord, NoAuthorization, ProcessResult} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SetShopOnboardDone | NoAuthorization | ProcessResult>) {
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
            if (!userId) {
                res.status(200).json({no_authorization: 1});
                return;
            } 
            const doc = await db.collection('mealdelivery').doc(userId).get();
            if (!doc.exists) {
                res.status(200).json({no_authorization: 1});
                return;
            } 
            const {usertype} = doc.data() as UserRecord;
            if (usertype !== 3){
                res.status(200).json({no_authorization: 1});
                return;
            }

            const { id, owner } = req.body;
            await db.collection('restaurants').doc(id).update({onboard: true});
            const docOwner = await db.collection('mealdelivery').doc(owner.id).get();
            let {shopid} = docOwner.data() as UserRecord;
            shopid = shopid || [];
            const idx = shopid.findIndex(item => item.id === id);
            if (idx > -1){
                shopid[idx] = {...shopid[idx], onboard: true};
            }
            await db.collection('mealdelivery').doc(owner.id).update({shopid: shopid});
            res.status(200).json({setshoponboard_done: 1, id});
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
