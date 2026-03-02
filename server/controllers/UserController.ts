import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail.js";

// Controllers to get All user Thumbnails
export const getUserThumbnails = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const thumbnails = await Thumbnail.find({ userId }).sort({ createdAt: -1 });
        res.json({ thumbnails });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    } 
};  

// Controller to get a single user Thumbnail of a User
export const getThumbnailById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const thumbnail = await Thumbnail.findOne({ userId, _id: id });
        
        if (!thumbnail) {
            return res.status(404).json({ message: 'Thumbnail not found' });
        }
        
        res.json({ thumbnail });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};
