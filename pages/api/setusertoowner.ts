import db from '@/lib/firestoreAdmin';
import {firestore} from 'firebase-admin';
import jwt from 'jsonwebtoken';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import {UserJwtPayload, SetUserToOwnerDone, UserRecord, NoAuthorization, ProcessResult} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<SetUserToOwnerDone | NoAuthorization | ProcessResult>) {
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
 
            const { id } = req.body;
            await db.collection('mealdelivery').doc(id).update({usertype: 2, tobeowner: false});
            await db.collection('mealdelivery').doc('summary').update({owners: firestore.FieldValue.increment(1)});
            res.status(200).json({setusertoowner_done: 1, id});
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
