import User from "../models/User.js"
import bcrypt from "bcryptjs"

async function login(req,res){
    console.log("Login Request Body:", req.body);
    const username = req.body.username
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
            console.log("User not found for:", username);
            return res.status(400).json({msg: "User does not exist"})
        }
        if (!(await bcrypt.compare(password,user.password))){
            console.log("Incorrect password for:", username);
            return res.status(401).json({msg: "Incorrect password"})
        }
        const token = user.createJWT()
        
        // Determine if we are in a secure environment (HTTPS)
        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';
        
        console.log("Login Successful. Secure:", isSecure, "Env:", process.env.NODE_ENV);

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

async function signup(req,res){
    console.log("Signup Request Body:", req.body);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password){
        return res.status(400).json({msg: "Please provide all fields"})
    }
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log("User already exists:", username, email);
            return res.status(400).json({ msg: "User with this username or email already exists" });
        }

        const user = await User.create({username, email, password})
        const token = user.createJWT()
        
        const isProduction = process.env.NODE_ENV === 'production';
        const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';
        
        console.log("Signup Successful. Secure:", isSecure, "Env:", process.env.NODE_ENV);
        
        res.cookie("token",token,{
            httpOnly: true,
            sameSite: isSecure ? "none" : "lax",
            secure: isSecure,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        
        return res.status(201).json({msg: "User created", user})
    } catch (error) {
        console.error("Signup Error:", error)
        return res.status(400).json({msg: "Error creating user", error: error.message})
    }
}

async function logout(req,res){
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';

    res.clearCookie("token",{
        httpOnly: true,
        sameSite: isSecure ? "none" : "lax",
        secure: isSecure
    })
    return res.status(200).json({msg: "User logged out"})
}

async function auth(req,res){
    try {
        const user = await User.findById(req.user.userID).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ msg: "Server Error" });
    }
}

export {login,signup, logout,auth}
