import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, NoAuthorization} from '@/lib/types';
import { pageSizeImages } from '@/lib/utils';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<string[] | NoAuthorization>) {
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
 
        let pageIndex: number;
        const {page} = req.query;
        if (!page){
            pageIndex = 0;
        }else{
            pageIndex = parseInt(page as string);
        }
        const limitNum = (pageIndex+1)*pageSizeImages; 

        const result: string[] = [];
        const snapshot = await db.collection('images').where('userId', '==', userId).limit(limitNum).get();
        snapshot.forEach(doc => {
            result.push(doc.id);
        });
        if (pageIndex > 0){
            res.status(200).json(result.slice(pageIndex*pageSizeImages, limitNum));
        }else{
            res.status(200).json(result);
        }
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                        