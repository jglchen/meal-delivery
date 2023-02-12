import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, ShopRecord, ShopDataType, UserRecord, NoAuthorization} from '@/lib/types';
import { pageSizeShops } from '@/lib/utils';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ShopRecord[] | NoAuthorization>) {
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

        let pageIndex: number;
        const {page} = req.query;
        if (!page){
            pageIndex = 0;
        }else{
            pageIndex = parseInt(page as string);
        }
        const limitNum = (pageIndex+1)*pageSizeShops; 

        const result: any = [];
        const snapshot = await db.collection('restaurants').where('onboard', '==', false).orderBy('created','desc').limit(limitNum).get();
        snapshot.forEach(doc => {
            const dataObj = {id: doc.id, ...doc.data()} as ShopDataType;
            result.push(dataObj);
        });
        let resArr;
        if (pageIndex > 0){
            resArr = result.slice(pageIndex*pageSizeShops, limitNum);
        }else{
            resArr = result;
        }
        
        const resArray: any = [];
        for (let elm of resArr){
            const ownerId = elm.owner;
            let ownerName = '';
            const doc = await db.collection('mealdelivery').doc(ownerId).get();
            if (doc.exists){
                ownerName = doc.data()?.name;
            }
            resArray.push({...elm, owner: {id: ownerId, name: ownerName}});
        }
        res.status(200).json(resArray);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                    