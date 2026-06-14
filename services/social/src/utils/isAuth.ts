import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

// Matches the shape set by user service when signing the token
interface IUser {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram?: string;
    linkedin?: string;
    bio?: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Please login - no auth header" });
            return;
        }

        const token = authHeader.split(" ")[1];
        const jwtSecret = process.env.JWT_SEC;

        if (!jwtSecret) {
            res.status(500).json({ message: "JWT secret is not configured" });
            return;
        }

        const decoded = jwt.verify(token as string, jwtSecret) as JwtPayload;

        if (!decoded || !decoded.user) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }

        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Please login - jwt error" });
    }
};
