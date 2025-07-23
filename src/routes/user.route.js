import express, { response } from "express"
import User from "../models/user.model.js"
import generateJwtToken from "../config/jwtGenrate.js"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { handlePasswordResetLink, handlePasswordResetPage, handleUserLogin, handleUserSignUp } from "../controller/user.controller.js"

const userRouter = express.Router()

userRouter.post("/signup", handleUserSignUp)

userRouter.post("/login", handleUserLogin)

userRouter.post("/reset-password-link", handlePasswordResetLink)

userRouter.put("/reset-password-page/:token", handlePasswordResetPage);

export default userRouter