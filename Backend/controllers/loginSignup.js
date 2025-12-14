import User from "../models/User.js"
import bcrypt from "bcryptjs"

async function login(req,res){
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
            return res.status(400).json({msg: "User does not exist"})
        }
        if (!(await bcrypt.compare(password,user.password))){
            return res.status(401).json({msg: "Incorrect password"})
        }
        const token = user.createJWT()
        // Use lax for localhost development
        res.cookie("token",token,{
            httpOnly: true,
            sameSite: "lax", 
            secure: false, // Set to true in production with https
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        return res.status(200).json({msg: "User logged in", user})
    } catch (error) {
        console.log(error)
        return res.status(400).json({msg: "Error logging in"})
    }
}

async function signup(req,res){
    const { username, email, password } = req.body;
    
    if (!username || !email || !password){
        return res.status(400).json({msg: "Please provide all fields"})
    }
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ msg: "User with this username or email already exists" });
        }

        const user = await User.create({username, email, password})
        const token = user.createJWT()
        
        res.cookie("token",token,{
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        
        return res.status(201).json({msg: "User created", user})
    } catch (error) {
        console.error("Signup Error:", error)
        return res.status(400).json({msg: "Error creating user", error: error.message})
    }
}

async function logout(req,res){
    res.clearCookie("token",{
        httpOnly: true,
        sameSite: "lax",
        secure: false
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
