import mongoose from "mongoose";

const passwordManagerSchema =  new mongoose.Schema({

    siteName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    passwordOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true })


const PasswordManager = mongoose.model("PasswordManager", passwordManagerSchema)

export default PasswordManager