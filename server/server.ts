import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import connectDB from './configs/db.js';
import AuthRouter from './routes/AuthRoutes.js';
import ThumbnailRouter from './routes/ThumbnailRoutes.js';
import UserRouter from './routes/UserRoutes.js';
import BillingRouter from './routes/BillingRoutes.js';
import { handleStripeWebhook } from './controllers/BillingController.js';
import { i18nMiddleware } from './middlewares/i18n.js';

// Connect to DB once on cold start; do not crash the module if it fails
connectDB().catch((err) => console.error('MongoDB connection error:', err));

const app = express();

/**
 * CORS: only matters for local development.
 * In production, all /api/* requests come through Vercel's proxy rewrite
 * as server-to-server calls, so the browser never makes cross-origin requests.
 * Auth is now JWT-based (Authorization header), so no cookie issues at all.
 */
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://copilot4yt.vercel.app',
];

app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Must be registered BEFORE express.json() so the raw Buffer is available for Stripe signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

// Attach req.locale from Accept-Language for all route handlers
app.use(i18nMiddleware);

app.set('trust proxy', 1);

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/auth', AuthRouter);
app.use('/api/thumbnail', ThumbnailRouter);
app.use('/api/user', UserRouter);
app.use('/api/billing', BillingRouter);


const port = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

export default app;