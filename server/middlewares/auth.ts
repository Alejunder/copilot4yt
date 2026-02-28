import { Request, Response, NextFunction } from "express";

const protect = (req: Request, res: Response, next: NextFunction) => {
    const {isLoggedIn, userId} = req.session;

    if (!isLoggedIn || !userId) {
        // More detailed logging for debugging iOS issues
        console.log('Auth failed - Session data:', { 
            isLoggedIn, 
            hasUserId: !!userId,
            sessionID: req.sessionID,
            cookies: req.headers.cookie ? 'present' : 'missing'
        });
        return res.status(401).json({ message: "You are not logged in" });
    }

    next();
}

export default protect;