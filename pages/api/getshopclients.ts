import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, UserRecord, ShopClientsElm, NoAuthorization} from '@/lib/types';
import { pageSizeClients } from '@/lib/utils';
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

        let pageIndex: number;
        const {shopId, orderByStr, page} = req.query;

        //Check userId is the owner of shopId
        let shopEl = shopList.find(item => item.id === shopId);
        if (!shopEl){
            res.status(200).json({no_authorization: 1});
            return;
        }

        if (!page){
            pageIndex = 0;
        }else{
            pageIndex = parseInt(page as string);
        }
        const limitNum = (pageIndex+1)*pageSizeClients;

        let result: ShopClientsElm[] = [];
        if (orderByStr === 'cancel'){
            const snapshot = await db.collection('restaurants').doc(shopId as string).collection('clients').orderBy('cancel', 'desc').orderBy('count', 'asc').limit(limitNum).get();
            snapshot.forEach(doc => {
                result.push({id: doc.id, ...doc.data()} as ShopClientsElm);
            });
        }else{
            const snapshot = await db.collection('restaurants').doc(shopId as string).collection('clients').orderBy('count', 'desc').orderBy('cancel', 'asc').limit(limitNum).get();
            snapshot.forEach(doc => {
                result.push({id: doc.id, ...doc.data()} as ShopClientsElm);
            });
        }

        if (pageIndex > 0){
            res.status(200).json(result.slice(pageIndex*pageSizeClients, limitNum));
        }else{
            res.status(200).json(result);
        }    

    } catch (e) {
        console.log(e);
        res.status(400).end();
    }

}

