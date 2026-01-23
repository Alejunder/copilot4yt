import express from "express";
import { registerUser, loginUser, verifyUser, logoutUser } from "../controllers/AuthControllers.js";
import protect from "../middlewares/auth.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", registerUser);
AuthRouter.post("/login", loginUser);
AuthRouter.post("/protect", protect, verifyUser);
AuthRouter.post("/logout", protect, logoutUser);
AuthRouter.get('/verify', protect, verifyUser); 

export default AuthRouter;
