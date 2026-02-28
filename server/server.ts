import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
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

await connectDB();

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://copilot4yt.vercel.app'
];

// Custom CORS middleware for Vercel serverless compatibility
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    // Set all necessary CORS headers explicitly
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
});

// Apply cors middleware as backup (belt and suspenders approach)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());

app.set('trust proxy', 1); // trust first proxy

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        // iOS Safari compatibility: Use 'none' for cross-origin, but ensure proper domain
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // Critical for iOS: Set explicit path
        path: '/',
        // Ensure cookie domain matches your deployment
        // Do not set domain for same-origin; only set if truly cross-domain
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