import { Router } from "express";
import { createCheckoutSession, getCredits, verifySession } from "../controllers/BillingController.js";
import protect from "../middlewares/auth.js";

const BillingRouter = Router();

BillingRouter.get("/credits", protect, getCredits);
BillingRouter.post("/checkout", protect, createCheckoutSession);
BillingRouter.get("/verify-session", protect, verifySession);
// /webhook is registered in server.ts with express.raw() before express.json()

export default BillingRouter;
