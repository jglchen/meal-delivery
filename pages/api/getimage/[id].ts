import db from '@/lib/firestoreAdmin';
import {promises as fs} from "fs";
import path from "path";
import {ImageDataType, NoData, FileName} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ImageDataType | FileName | NoData>) {
    try {         
        const {id} = req.query as {id: string};
        const targetPath = path.join(process.cwd(), '/', 'public', 'images', id);
        try {
            await fs.access(targetPath);
            res.status(200).json({filename: `/images/${id}`});
        } catch (e) {
            const doc = await db.collection('images').doc(id as string).get();
            if (!doc.exists) {
                res.status(200).json({no_data: 1});
                return;
            }
            const docObj = doc.data();
            const base64Data = docObj?.base64;
            try {
                await fs.writeFile(id, base64Data, 'base64');
                await fs.rename(id, targetPath);
            }catch(e){
                console.log(e);
            }
           res.status(200).json({id, ...doc.data()} as ImageDataType);       
        }
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                   