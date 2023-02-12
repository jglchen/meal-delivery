import db from '@/lib/firestoreAdmin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import {UserJwtPayload, User, UserData, NoAuthorization, ProcessResult} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse<User | NoAuthorization | ProcessResult>) {
    try {
        if (req.method === 'POST'){
            //Check Authorization
            const {authorization} = req.headers;
            if (!authorization){
                res.status(200).json({no_authorization: 1});
                return;
            }
            const token: string = authorization.replace('Bearer ', '');
            if (!token){
                res.status(200).json({no_authorization: 1});
                return;
            }
            const { userId } = jwt.verify(token, APP_SECRET) as UserJwtPayload;
            if (!userId) {
                res.status(200).json({no_authorization: 1});
                return;
            } 
            let {password} = req.body;
            password = await bcrypt.hash(password, 10);
            await db.collection('mealdelivery').doc(userId).update({password: password});
            const doc = await db.collection('mealdelivery').doc(userId).get();
            const userData = {id: userId, ...doc.data()} as UserData;
            delete userData.password;
            delete userData.tobeownerAt;
            const user: User & {created?: string} = {...userData, token};
            delete user.created;
            res.status(200).json(user);
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
