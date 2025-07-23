import "dotenv/config"
import jwt from "jsonwebtoken"

const generateJwtToken = async (userPayload) => {
    console.log("payload" , userPayload)
    try {

        const token = await jwt.sign({ id : userPayload }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })

        return token

    } catch (error) {
        console.log("Error to genrate the JWT token")
    }
}

export default generateJwtToken