import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, UserRecord, ShopClientsElm, NoAuthorization} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ShopClientsElm[] | NoAuthorization>) {
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

       const {shopId, clientIdStr} = req.query;

        //Check userId is the owner of shopId
        let shopEl = shopList.find(item => item.id === shopId);
        if (!shopEl){
            res.status(200).json({no_authorization: 1});
            return;
        }

        const clientIds = (clientIdStr as string).split(',');
 
        const result: ShopClientsElm[] = [];
        for (let clientId of clientIds){
            const doc = await db.collection('restaurants').doc(shopId as string).collection('clients').doc(clientId).get();
            if (doc.exists) {
               result.push({id: doc.id, ...doc.data()} as ShopClientsElm);
            }    
        }

        res.status(200).json(result);

    } catch (e) {
        console.log(e);
        res.status(400).end();
    }

}

