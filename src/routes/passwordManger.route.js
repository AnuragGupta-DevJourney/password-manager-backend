import express, { response } from "express"
import PasswordManager from "../models/passwordManger.model.js"
import "dotenv/config"
import CryptoJS from "crypto-js"
import authenticationMiddleware from "../middleware/authentication.middleware.js"
import User from "../models/user.model.js"

const passwordManagerRoutes = express.Router()

const encryptingThePasswordVault = (password) => {
    return CryptoJS.AES.encrypt(password, process.env.ENCRYPTION_SECRET_KEY).toString()
}

const decryptingThePasswordVault = (cipherTextpassword) => {
    return CryptoJS.AES.decrypt(cipherTextpassword, process.env.ENCRYPTION_SECRET_KEY).toString(CryptoJS.enc.Utf8)
}

passwordManagerRoutes.post("/credential-input", async (req, res) => {

    try {
        const { siteName, email, password } = req.body

        const encryptedPassword = encryptingThePasswordVault(password)

        const user = new PasswordManager({
            siteName: siteName,
            email: email,
            password: encryptedPassword,
            passwordOwner: req.user.id
        })
        const response = await user.save()

        console.log(response)

        res.status(200).json({
            message: "credential added sucessfully in the vault",
        })

    } catch (error) {
        console.log("Internale server Error while adding creadential details")
        res.status(500).json({
            message: "Internale server Error while adding creadential details"
        })
    }
})

passwordManagerRoutes.get("/all-credential-data", async (req, res) => {

    const postdata = await PasswordManager.find({ passwordOwner: req.user.id }).select(" -passwordOwner")

    const updatedPostData = postdata.map((data) => {
        const decryptedPassword = decryptingThePasswordVault(data.password)
        return { ...data._doc, password: decryptedPassword }
    })

    // console.log(updatedPostData)

    res.send(updatedPostData)

})

passwordManagerRoutes.delete("/credential-delete/:id", async (req, res) => {
    try {

        console.log("delet called")

        const { id } = req.params

        const response = await PasswordManager.deleteOne({ _id: id })

        if (response.acknowledged === true && response.deletedCount === 1) {
            res.status(200).json({
                message: "Credential Deleted Sucessfully"
            })
        }
        else {
            res.status(400).json({
                messsage: "Getting Inavlide credential ID"
            })
        }


    } catch (error) {
        console.log("Internal Error while deleting the credentials")
        return res.status(500).json({
            message: "Internal server Error",
            error: error
        })
    }
})

passwordManagerRoutes.get("/single-credential-details/:id", async (req, res) => {
    try {
        const { id } = req.params

        console.log("ID", id)

        const response = await PasswordManager.findById(id).select("-passwordOwner ")
        const updatedResponse = { ...response._doc, password: decryptingThePasswordVault(response.password) }
        res.status(200).json({
            message: "Data fetched Succesfully",
            response: updatedResponse
        })
        if (!response) {
            res.status(404).json({
                message: "Data Not Found"
            })
        }
    } catch (error) {
        console.log("Internal Server Error", error)
        return res.status(500).json({
            message: "Internal Sever Error while fetching the data",
            error: error
        })
    }
})

passwordManagerRoutes.put("/single-credential-update/:id", async (req, res) => {
    try {
        console.log("called");
        const { id } = req.params;
        const payload = req.body;
        const updatedPayload = { ...payload, password: encryptingThePasswordVault(payload.password) }
        console.log({ id, updatedPayload });

        const response = await PasswordManager.findByIdAndUpdate(id, updatedPayload, {
            new: true,
        });

        if (!response) {
            return res.status(404).json({
                message: "Credential not found",
            });
        }

        res.status(200).json({
            message: "Credential updated successfully",
            data: response,
        });
    } catch (error) {
        console.log("Internal Server Error while updating the credential", error);
        res.status(500).json({
            message: "Internal Server Error while Updating the Credential",
            error: error.message || error,
        });
    }
});

passwordManagerRoutes.get("/change-password", async (req, res) => {
    try {
        const { id } = req.user
        const user = await User.findById(id).select(" -password ")

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        res.status(200).json(user)
    } catch (error) {
        console.log("Internal Error While Fetching the data", error)
    }

})

passwordManagerRoutes.put("/change-password/:id", async (req, res) => {
    try {

        const { id } = req.params

        const { fullname, email, username, newPassword } = req.body

        console.log({ id, newPassword })

        const user = await User.findOne({ _id: id })

        if (!user) {
            return res.status(409).json({
                message: "Unable to update the password"
            })
        }

        const isUserExist = await User.findOne({
            $or: [{ email: email }, { username: username }],
            _id: { $ne: id }
        });
        if (isUserExist) {
            return res.status(409).json({
                message: "Contain username or Email Exist"
            })
        }

        user.fullname = fullname
        user.username = username
        user.email = email
        user.password = newPassword
        user.markModified("password")

        const response = await user.save()

        return res.status(200).json({
            message: "Profile upadted successfully!!!",
            response: response
        })

    } catch (error) {
        console.log("Internal Error Failed to update the password ")
    }

})



export default passwordManagerRoutes