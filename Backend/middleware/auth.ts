import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";

async function authorization(req: Request, res: Response, next: NextFunction){
    if (!req.cookies.token){
        return res.status(401).json({msg: "Not authorized"})
    }
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const token = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
        req.user = token
        next()
    } catch (error) {
        return res.status(401).json({msg : "Not authorized"})
    }
}

export default authorization