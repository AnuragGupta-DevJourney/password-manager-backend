import User from "../models/user.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import generateJwtToken from "../config/jwtGenrate.js"

export const handleUserLogin = async (req, res) => {

    try {
        const { email, username, password } = req.body

        console.log("login details", {
            email: email,
            username: username,
            password: password
        })

        const user = await User.findOne({ $or: [{ email: email }, { username: username }] })

        if (!user) {
            return res.status(404).json({
                message: "contained usernamer or email user not exist"
            })
        }

        const checkPasswordCorrect = await user.isPasswordCorrect(password)
        console.log({ checkPasswordCorrect })

        if ((user.email === email || user.username) && checkPasswordCorrect === true) {
            const token = await generateJwtToken(user.id)
            return res.status(200).json({
                message: "Login successfully",
                token: token,
                response: user.fullname
            })
        }
        else {
            return res.status(401).json({
                message: "Invalid password"
            })
        }

    } catch (error) {
        console.log("Internal Erro while login", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const handleUserSignUp = async (req, res) => {
    console.log(req.body)

    try {
        const { fullname, username, email, password, confirmPassword } = req.body

        const payload = {
            fullname: fullname,
            username: username,
            email: email,
            password: password,
            // confirmPassword: confirmPassword
        }

        const checkUsernamExist = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        })

        if (checkUsernamExist) {
            return res.status(409).json({
                message: "username or email already taken"
            })
        }

        // if (password !== confirmPassword) {
        //     return res.status(400).json({
        //         message: "confirm password is not correct"
        //     })
        // }

        const user = new User(payload)
        const response = await user.save()

        return res.status(200).json({
            message: "Sign Up Successfully!",
            response: response
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error !!!"
        })
    }

}

export const handlePasswordResetLink = async (req, res) => {

    try {
        const { email, username } = req.body


        const user = await User.findOne({ $or: [{ email: email }, { username: username }] })

        if (!user) {
            return res.status(404).json({
                message: "Entered username or email user not exist"
            })
        }

        console.log("Email" ,user.email)
        // Generate a reset token (random string)
        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log("reset token" , resetToken)
        // Save the token and set an expiry (1 hour)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        const response = await user.save();

        console.log("end"  ,response)

        // Send email with the reset link
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anuraggupta2004a@gmail.com',
                pass: 'twkakpdcmtmfzupu'
            }
        });
        const localhost_URL = "http://localhost:5173"
        const resetLink = `https://password-manager-vault.netlify.app/reset-password-page/${resetToken}`;  // Update with frontend URL

        await transporter.sendMail({
            from : "anuraggupta2004a@gmail.com",
            to: user.email,
            subject: "Password Reset Request",
            text: `Click this link to reset your password: ${resetLink}`
        });

        return res.status(200).json({
            message: "Password reset link has been sent to your email."
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error While sending the Email Link"
        });

    }


}


export const handlePasswordResetPage = async (req, res) => {
    console.log("password reset pasge called here")
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        console.log({token , newPassword})
        // Find user with valid token and expiry time
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Check if token is expired
        });

        console.log(user)

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        // Token is valid, update password
        user.password = newPassword;  // New password entered by the user
        user.resetPasswordToken = undefined;  // Clear token
        user.resetPasswordExpires = undefined;  // Clear expiry

        // Mark password as modified to trigger pre-save hook
        user.markModified("password");

        await user.save();  // Save updated password

        return res.status(200).json({
            message: "Password updated successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error While Updating The Password"
        });
    }
}