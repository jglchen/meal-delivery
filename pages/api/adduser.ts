import db from '@/lib/firestoreAdmin';
import {firestore} from 'firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {User, DuplicateEmail, ProcessResult} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';
import { createGmailTransporter, outlookTransporter } from '@/lib/mailapi';
import { intentToBeOwnerHTML } from '@/lib/utils';
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse<User | DuplicateEmail | ProcessResult>) {
    try {
        if (req.method === 'POST'){
            const {email} = req.body;
            const entryQuery = await db.collection('mealdelivery').where('email', '==', email).get();
            if (!entryQuery.empty){
                res.status(200).json({duplicate_email: 1});
                return;
            }
            
            let {password, tobeowner} = req.body;
            password = await bcrypt.hash(password, 10);
            const user = {...req.body, password};
            const currTime = new Date().toISOString();
            let userToDB;
            if (user.tobeowner){
                userToDB = {...user, created: currTime, tobeownerAt: currTime};
            }else{
                userToDB = {...user, created: currTime};
            }
            const { id } = await db.collection('mealdelivery').add(userToDB);
            await db.collection('mealdelivery').doc('summary').update({users: firestore.FieldValue.increment(1)});
            const token = jwt.sign({ userId: id}, APP_SECRET);
            delete user.password;

            //Send email to app administrator if tobeowner is true
            if (user.tobeowner){
                let emailTransporter: any;
                let senderMail: string;
                // Create the transporter with the required configuration
                try{
                    emailTransporter = await createGmailTransporter();
                    senderMail = serverRuntimeConfig.GMAIL_EMAIL as string;
                }catch(err){
                    emailTransporter = outlookTransporter;
                    senderMail = serverRuntimeConfig.SENDER_MAIL_USER as string;
                }
                // setup e-mail data, even with unicode symbols
                const mailOptions = {
                    from: `"No Reply - Happy Eats! " <${senderMail}>`, // sender address (who sends)
                    to: serverRuntimeConfig.GMAIL_EMAIL, // list of receivers (who receives)
                    subject: "A user has expressed an intent to be a restaurant owner, which is awaiting your approval.", // Subject line
                    html: intentToBeOwnerHTML(user.name)
                };
                try {
                    if (senderMail === serverRuntimeConfig.GMAIL_EMAIL){
                        await emailTransporter.sendMail(mailOptions);
                    }else{
                        //Code for ordinary local development
                        //emailTransporter.sendMail(mailOptions);
                    
                        //Special code for Vercel
                        await new Promise((resolve, reject) => {
                            // verify connection configuration
                            emailTransporter.verify(function (error: any, success: any) {
                                if (error) {
                                    console.log(error);
                                    reject(error);
                                } else {
                                    console.log("Server is ready to take our messages");
                                    resolve(success);
                                }
                            });
                        });
                                    
                        await new Promise((resolve, reject) => {
                            // send mail
                            emailTransporter.sendMail(mailOptions, (err: any, info: any) => {
                                if (err) {
                                    console.error(err);
                                    reject(err);
                                } else {
                                    console.log(info);
                                    resolve(info);
                                }
                            });
                        });
                    }
                }catch(e){
                    //-----
                }
            }

            res.status(200).json({ id, ...user, token });
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
