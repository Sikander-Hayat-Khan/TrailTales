import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required : [true,"No name provided"],
        trim : true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "No email provided"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
        ],
    },
    password:{
        type: String,
        required: [true,"No password provided"]
    },
    bio: {
        type: String,
        default: "Just a traveler exploring the world one pin at a time.",
        maxlength: 150,
    },
    avatarColor: {
        type: String,
        default: "#f28b50",
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})
UserSchema.pre("save",async function(){
    if (!this.isModified('password')) return;
    const salt = await bcryptjs.genSalt(10)
    this.password = await bcryptjs.hash(this.password,salt)
})
UserSchema.methods.createJWT = function(){
    return jwt.sign({userID:this._id,username: this.username},process.env.JWT_SECRET,{expiresIn:"30d"})
}

export default mongoose.model("User",UserSchema)