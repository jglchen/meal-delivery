import db from '@/lib/firestoreAdmin';
import {ImageDataType, NoData} from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ImageDataType | NoData>) {
    try {         
        const {id} = req.query as {id: string};
        const doc = await db.collection('images').doc(id).get();
        if (!doc.exists) {
            res.status(200).json({no_data: 1});
            return;
        } 
        res.status(200).json({id, ...doc.data()} as ImageDataType);
    } catch (e) {
        console.log(e);
        res.status(400).end();
    }
}                   