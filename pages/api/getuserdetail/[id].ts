import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import {UserJwtPayload, UserData, UserRecord, NoData, NoAuthorization} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<UserData | NoData | NoAuthorization>) {
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
        if (usertype < 2){
            res.status(200).json({no_authorization: 1});
            return;
        }
 
        const {id} = req.query as {id: string};
        const docUser = await db.collection('mealdelivery').doc(id).get();
        if (!docUser.exists) {
            res.status(200).json({no_data: 1});
            return;
        } 
        const dataUser = {id, ...docUser.data()} as UserData;
        if (dataUser.usertype >= usertype && usertype !== 3){
            res.status(200).json({no_authorization: 1});
            return;
        }
        delete dataUser.password;
        res.status(200).json(dataUser);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                