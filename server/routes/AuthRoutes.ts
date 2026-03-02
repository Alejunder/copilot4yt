import express from "express";
import { registerUser, loginUser, verifyUser, logoutUser } from "../controllers/AuthControllers.js";
import protect from "../middlewares/auth.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", registerUser);
AuthRouter.post("/login", loginUser);
AuthRouter.post("/logout", logoutUser);       // JWT logout is client-side; no protect needed
AuthRouter.get('/verify', protect, verifyUser);  // validates the JWT and returns user data

export default AuthRouter;
