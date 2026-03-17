import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import connectDB from './configs/db.js';
import AuthRouter from './routes/AuthRoutes.js';
import ThumbnailRouter from './routes/ThumbnailRoutes.js';
import UserRouter from './routes/UserRoutes.js';
import BillingRouter from './routes/BillingRoutes.js';
import { handleStripeWebhook } from './controllers/BillingController.js';
import { i18nMiddleware } from './middlewares/i18n.js';

connectDB().catch((err) => console.error('MongoDB connection error:', err));

const app = express();

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

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

app.use(i18nMiddleware);

app.set('trust proxy', 1);

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
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