import type {Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export function authMiddleware(req: Request, res: Response, next: NextFunction){
    const header = req.headers.authorization; 
    if (!header) return res.status(403).send("");
    
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : header;
    
    try{
        let data = jwt.verify(token, process.env.JWT_SECRET!);
        req.userId = data.sub as string;
        next();
    }catch(e){
        res.status(403).send("");
    }
}