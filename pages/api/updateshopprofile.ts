import db from '@/lib/firestoreAdmin';
import jwt from 'jsonwebtoken';
import { promises as fs } from "fs";
import path from "path";
import formidable, { File } from 'formidable';
import sizeOf from 'image-size';
import sharp from 'sharp';
import {UserJwtPayload, UserRecord, NoAuthorization, ProcessResult} from '@/lib/types';
const APP_SECRET = process.env.NEXT_PUBLIC_JWT_APP_SECRET as string;
import type { NextApiRequest, NextApiResponse } from 'next';
import { maxImageWidth, getRandomInt } from '@/lib/utils';

export const config = {
    api: {
        bodyParser: false,
    }
};

type ProcessedFiles = Array<[string, File]>;
type ProcessedFields = Array<[string, string]>;
type ProcessedResult = {
    files: ProcessedFiles | undefined;
    fields: ProcessedFields | undefined;
}

interface ShopProfile {
    shopId: string;
    profileimage: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ShopProfile | NoAuthorization | ProcessResult>) {
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

            const form = new formidable.IncomingForm();

            // Get files using formidable
            const result = await new Promise<ProcessedResult>((resolve, reject) => {
                const files: ProcessedFiles = [];
                const fields: ProcessedFields = [];
                form.on('file', function (field, file) {
                   files.push([field, file]);
                });
                form.on('field', function(key, value) {
                   fields.push([key, value]);
                });
                form.on('end', () => resolve({files, fields}));
                form.on('error', err => reject(err));
                form.parse(req, () => {
                  //
                });
            });
 
            const {files, fields} = result as ProcessedResult;

            let shopId = '';     
            if (fields?.length){
                for (const field of fields) {
                    if (field[0] === 'shopid'){
                        shopId = field[1];
                    }   
                }  
            }

            //Check userId is the owner of shopId
            let shopEl = shopList.find(item => item.id === shopId);
            if (!shopEl){
                res.status(200).json({no_authorization: 1});
                return;
            }

            const profileImgs = [];
            if (files?.length){
                /* Create directory for uploads */
                const targetPath = path.join(process.cwd(), '/', 'public', 'images');
                try {
                    await fs.access(targetPath);
                } catch (e) {
                    await fs.mkdir(targetPath);
                }
                
                for (const file of files) {
                    const tempPath = file[1].filepath;
                    let mimetype = file[1].mimetype;
                    const dimensions = sizeOf(tempPath);
                    let width = dimensions.width as number;
                    let height = dimensions.height as number;
                    let base64Data;
                    let filename = file[1].originalFilename as string;
                    //Change filename if resize is requires
                    if (width > maxImageWidth){
                        const filenames = filename.split('.');
                        filename = `${filenames[0]}.png`;
                    }
                    //Check if filenames is duplicate
                    let doc = await db.collection('images').doc(filename).get();
                    while (doc.exists){
                        const filenames = filename.split('.'); 
                        filename = `${filenames[0]}-${getRandomInt(100)}.${filenames[1]}`;
                        doc = await db.collection('images').doc(filename).get();   
                    }
                    
                    if (width > maxImageWidth){
                        height = Math.round(maxImageWidth*(height / width));
                        width = maxImageWidth;
                        const data = await sharp(tempPath)
                                           .resize(width, height)
                                           .png()
                                           .toBuffer(); 
                        try {
                           await fs.writeFile(filename, data);
                           await fs.rename(filename, `${targetPath}/${filename}`);
                        }catch(e){
                           console.log(e);
                        }
                        base64Data = data.toString('base64'); 
                        mimetype = "image/png"; 
                     }else{
                        base64Data = await fs.readFile(tempPath, 'base64');
                        try {
                            await fs.rename(tempPath, `${targetPath}/${filename}`);
                        }catch(e){
                            console.log(e);
                        }
                    } 
                    const res = await db.collection('images').doc(filename).set({base64: base64Data, mimetype, width, height, userId});
                    profileImgs.push(filename);
                }
            }
            const profileimage = profileImgs[0] || '';

            const resp = await db.collection('restaurants').doc(shopId).update({profileimage});
            res.status(200).json({shopId, profileimage});   
        }else{
            // Handle any other HTTP method
            res.status(405).json({ status: 'fail', message: `Method '${req.method}' Not Allowed` });
        }
    } catch (e) {
        res.status(400).end();
    }
}
