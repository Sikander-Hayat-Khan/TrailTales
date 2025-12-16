import { Request, Response } from "express";
import User from "../models/User.js"
import bcrypt from "bcryptjs"

async function login(req: Request, res: Response){
    const username = req.body.username
    // Log attempt without sensitive data
    console.log({
        timestamp: new Date().toISOString(),
        action: "login_attempt",
        username: username
    });

    const password = req.body.password
    if (!username){
        return res.status(400).json({msg: "No username"})
    }
    if (!password){
        return res.status(400).json({msg: "No password"})
    }
    try {
        // Allow login with email or username
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });
        
        if(!user){
            console.log({
                timestamp: new Date().toISOString(),
                action: "login_failed",
                reason: "user_not_found",
                username: username
            });
            return res.status(400).json({msg: "User does not exist"})
        }
        if (!(await bcrypt.compare(password,user.password))){
            console.log({
                timestamp: new Date().toISOString(),
                action: "login_failed",
                reason: "incorrect_password",
                username: username
            });
            return res.status(401).json({msg: "Incorrect password"})
        }
        const token = (user as any).createJWT()
        
        // Determine if we are in a secure environment (HTTPS)
        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';
        
        console.log({
            timestamp: new Date().toISOString(),
            action: "login_success",
            username: username,
            secure: isSecure
        });

        res.cookie("token",token,{
            httpOnly: true,
            sameSite: isSecure ? "none" : "lax",
            secure: isSecure,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        return res.status(200).json({msg: "User logged in", user})
    } catch (error) {
        console.log("Login Error:", error)
        return res.status(400).json({msg: "Error logging in"})
    }
}

async function signup(req: Request, res: Response){
    const { username, email, password } = req.body;
    // Log attempt without sensitive data
    console.log({
        timestamp: new Date().toISOString(),
        action: "signup_attempt",
        username: username,
        email: email
    });
    
    if (!username || !email || !password){
        return res.status(400).json({msg: "Please provide all fields"})
    }
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log({
                timestamp: new Date().toISOString(),
                action: "signup_failed",
                reason: "user_exists",
                username: username
            });
            return res.status(400).json({ msg: "User with this username or email already exists" });
        }

        const user = await User.create({username, email, password})
        const token = (user as any).createJWT()
        
        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';
        
        console.log({
            timestamp: new Date().toISOString(),
            action: "signup_success",
            username: username,
            secure: isSecure
        });
        
        res.cookie("token",token,{
            httpOnly: true,
            sameSite: isSecure ? "none" : "lax",
            secure: isSecure,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        
        return res.status(201).json({msg: "User created", user})
    } catch (error) {
        console.error("Signup Error:", error)
        return res.status(400).json({msg: "Error creating user", error: (error as any).message})
    }
}

async function logout(req: Request, res: Response){
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.clearCookie("token",{
        httpOnly: true,
        sameSite: isSecure ? "none" : "lax",
        secure: isSecure
    })
    return res.status(200).json({msg: "User logged out"})
}

async function auth(req: Request, res: Response){
    try {
        const user = await User.findById((req.user as any).userID).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ msg: "Server Error" });
    }
}

export {login,signup, logout,auth}
