import db from '@/lib/firestoreAdmin';
import {firestore} from 'firebase-admin';
import jwt from 'jsonwebtoken';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
const PUBLIC_CODE = process.env.NEXT_PUBLIC_PUBLIC_CODE as string;
import {UserJwtPayload, MealOrderType, NoAuthorization, ProcessResult} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createGmailTransporter, outlookTransporter } from '@/lib/mailapi';
import { pseudoAcct, mealOrderNoticeHTML } from '@/lib/utils';
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

export default async function handler(req: NextApiRequest, res: NextApiResponse<MealOrderType | NoAuthorization | ProcessResult>) {
    try {
        if (req.method === 'POST'){
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
            

            const { userId: userid, userName, shopId, shopName, owner, orderList, sum, tax, address, addressregister} = req.body;

            if (userId !== userid){
                res.status(200).json({no_authorization: 1});
                return;
            }
            
            const currTime = new Date().toISOString();
            const orderData = { userId, userName, orderList, sum, tax, address, active: true, orderstatus: 0, statushistory: [currTime], created: currTime};
            const { id } = await db.collection('restaurants').doc(shopId).collection('mealorders').add(orderData);
            const orderid = `${shopId}_${id}`;
            //orderrecent
            await db.collection('restaurants').doc(shopId).collection('orderrecent').doc('orderrecent').set({id, ...orderData, publiccode: PUBLIC_CODE});
            const doc = await db.collection('restaurants').doc(shopId).collection('clients').doc(userId).get();
            if (doc.exists){
                await db.collection('restaurants').doc(shopId).collection('clients').doc(userId).update({userName, count: firestore.FieldValue.increment(1)});
            }else{
                await db.collection('restaurants').doc(shopId).collection('clients').doc(userId).set({userName, count: 1, cancel: 0});
            }
            
            await db.collection('mealdelivery').doc(userId).collection('mealorders').doc(orderid).set({active: true, orderstatus: 0, shopId, created: currTime});
            const docShop = await db.collection('mealdelivery').doc(userId).collection('ordershops').doc(shopId).get();
            if (docShop.exists){
                await db.collection('mealdelivery').doc(userId).collection('ordershops').doc(shopId).update({count: firestore.FieldValue.increment(1)}); 
            }else{
                await db.collection('mealdelivery').doc(userId).collection('ordershops').doc(shopId).set({count: 1, cancel: 0});
            }

            if (addressregister){
               await db.collection('mealdelivery').doc(userId).update({address});
            }

            //Send email to restaurant owner to notice it
            const docOwner = await db.collection('mealdelivery').doc(owner).get();
            let email;
            if (docOwner.exists) {
                email = docOwner.data()!.email;
            } 
            if (pseudoAcct.includes(email)){
                email = serverRuntimeConfig.GMAIL_EMAIL;
            } 
            if (email){
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
                    to: email, // list of receivers (who receives)
                    subject: `A consumer just placed a meal delivery order at ${shopName} for you to start processing`, // Subject line
                    html: mealOrderNoticeHTML(shopName)
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

            res.status(200).json({id, shopId, userId, userName, orderList, sum, tax, address, active: true, orderstatus: 0, statushistory: [currTime], created: currTime});
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
       