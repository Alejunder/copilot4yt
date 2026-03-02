import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import connectDB from './configs/db.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import AuthRouter from './routes/AuthRoutes.js';
import ThumbnailRouter from './routes/ThumbnailRoutes.js';
import UserRouter from './routes/UserRoutes.js';


declare module 'express-session' {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
    }
}

// Connect to DB once on cold start; do not crash the module if it fails
connectDB().catch((err) => console.error('MongoDB connection error:', err));

const app = express();

/**
 * CORS strategy:
 * In production, the Vercel proxy routes /api/* as a server-to-server request,
 * so the browser never sees a cross-origin call. CORS headers here only matter
 * for local development (direct browser → localhost:3000 calls).
 * Keeping the config explicit for safety and clarity.
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

app.use(express.json());

app.set('trust proxy', 1); // trust first proxy

/**
 * Session cookie strategy:
 * The frontend is served at the same origin via a Vercel proxy rewrite.
 * All /api/* requests are same-site from the browser's perspective, so:
 *   - sameSite: 'lax' is sufficient and secure (no need for 'none')
 *   - 'none' required SameSite=None + Secure and was still blocked by Safari ITP
 *   - With same-origin proxying, Safari treats cookies as first-party → no ITP issues
 */
app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // Always require HTTPS in production — Vercel always runs HTTPS
        secure: process.env.NODE_ENV === 'production',
        // httpOnly prevents JS access to the cookie (XSS protection)
        httpOnly: true,
        // 'lax' is safe now that frontend and API are same-origin via proxy
        // This also works correctly in Safari private mode and with ITP enabled
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        path: '/',
        // Do NOT set domain — let the browser scope it to the proxy's origin automatically
    },
    store:  MongoStore.create({
        mongoUrl: process.env.MONGO_URI as string,
        collectionName: 'sessions',
    }),
    // Important for iOS Safari: Ensure session is saved even if not modified
    rolling: true,  // Reset maxAge on every response
    proxy: true,    // Trust the reverse proxy for secure cookies
}));

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});
app.use('/api/auth', AuthRouter);
app.use('/api/thumbnail', ThumbnailRouter); // Thumbnail routes would be here
app.use('/api/user', UserRouter); // User routes would be here


const port = process.env.PORT || 3000;

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

// Export for Vercel serverless
export default app;