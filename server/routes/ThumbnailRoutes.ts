import  express  from "express";
import {deleteThumbnail, generateThumbnail} from "../controllers/ThumbnailController.js";
import  protect from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const ThumbnailRouter = express.Router();

ThumbnailRouter.post("/generate", protect, upload.single('reference_image'), generateThumbnail);
ThumbnailRouter.delete("/delete/:id", protect, deleteThumbnail);

export default ThumbnailRouter;