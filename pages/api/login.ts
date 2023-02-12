import db from '@/lib/firestoreAdmin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User, NoAccount, PasswdErr, ProcessResult} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<User | NoAccount | PasswdErr | ProcessResult>) {
    try {
        if (req.method === 'POST'){
            const {email, password} = req.body;
            const entryQuery = await db.collection('mealdelivery').where('email', '==', email).get();
            if (entryQuery.empty){
                res.status(200).json({no_account: 1});
                return;
            }
            
            const arr: any = [];
            entryQuery.forEach(doc => {
                arr.push({id: doc.id, ...doc.data()}); 
            });
            const user = arr[0];
            const valid = await bcrypt.compare(password, user.password)
            if (!valid) {
                res.status(200).json({password_error: 1});
                return;
            }
            const token = jwt.sign({ userId: user.id }, APP_SECRET);
            delete user.password;
            res.status(200).json({ ...user, token });
       }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}    