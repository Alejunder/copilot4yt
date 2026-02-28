import express, { Request, Response } from 'express';
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

// CORS configuration optimized for iOS Safari
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://copilot4yt.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, // Cache preflight for 24 hours
}));

// Handle OPTIONS requests explicitly (important for iOS)
app.options('*', cors());

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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});