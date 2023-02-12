import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, MealOrderType, ShopDataRecord, NoAuthorization} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

interface ShopIdType {
    id: string;
    shopname: string;
}

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

        const orderIds: string[] = [];
        const snapshot = await db.collection('mealdelivery').doc(userId).collection('mealorders').where('active', '==', true).get();
        snapshot.forEach(doc => {
            orderIds.push(doc.id);
        });
        
       
        let orderList: MealOrderType[] = [];
        const shopIds: string[]  = [];
        for (let elm of orderIds){
            const [shopId, id] = elm.split('_');
            if (!shopIds.includes(shopId)){
                shopIds.push(shopId);
            }
            const doc = await db.collection('restaurants').doc(shopId).collection('mealorders').doc(id).get();
            if (doc.exists) {
                orderList.push({...doc.data(), shopId, id} as MealOrderType);
            } 
        }

        const shopList: ShopIdType[] = [];
        for (let shopId of shopIds){
            const doc = await db.collection('restaurants').doc(shopId).get();
            if (doc.exists){
               const { shopname } = doc.data() as ShopDataRecord;
               shopList.push({id: shopId, shopname});
            }
        }

        orderList = orderList.map(item => {
            const elm = shopList.find(itm => 
               itm.id === item.shopId
            );
            if (!elm){
                return item;
            }
            return {...item, shopName: elm.shopname};
        })

        res.status(200).json(orderList);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                            