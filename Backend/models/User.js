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
    password:{
        type: String,
        required: [true,"No password provided"]
    }
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