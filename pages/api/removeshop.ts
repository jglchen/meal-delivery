import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, UserRecord, ShopDelete, NoAuthorization, ProcessResult} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ShopDelete | NoAuthorization | ProcessResult>) {
    try {
        if (req.method === 'DELETE'){
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
            const doc = await db.collection('mealdelivery').doc(userId).get();
            if (!doc.exists) {
                res.status(200).json({no_authorization: 1});
                return;
            } 
            let {usertype, shopid: shopList} = doc.data() as UserRecord;
            if (usertype < 2){
                res.status(200).json({no_authorization: 1});
                return;
            }
            if (!shopList || shopList.length === 0){
                res.status(200).json({no_authorization: 1});
                return;
            }

            const {shopId} = req.body;

            //Check userId is the owner of shopId
            let shopEl = shopList.find(item => item.id === shopId && item.onboard === false);
            if (!shopEl){
                res.status(200).json({no_authorization: 1});
                return;
            }

            shopList = shopList.filter(item => item.id !== shopId);
            await db.collection('mealdelivery').doc(userId).update({shopid: shopList});

            const resp = await db.collection('restaurants').doc(shopId).delete();
            res.status(200).json({shop_delete: 1});   
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
