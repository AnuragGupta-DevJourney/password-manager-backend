import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userShema = new mongoose.Schema({

    fullname: {
        type: String,
        required: [true, "Fullname required"]
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true
    },
    // confirmPassword: {
    //     type: String,
    //     required: true
    // }
    resetPasswordToken : String,
    resetPasswordExpires : Date

}, { timestamps: true })

userShema.pre("save" , async function(next){

    if(this.isModified("password")){
        console.log("Hash Password called")
        const generateSalt = await bcrypt.genSalt(8)
        this.password = await bcrypt.hash(this.password , generateSalt )
    }
    next()
})

userShema.methods.isPasswordCorrect = async function (passwordInString) {
    return await bcrypt.compare(passwordInString,this.password)
}

const User = mongoose.model("User", userShema)

export default User