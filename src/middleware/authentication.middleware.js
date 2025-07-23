
import "dotenv/config"
import jwt from "jsonwebtoken"

const authenticationMiddleware = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization

        if (!authHeader) {
            return res.status(404).json({
                message: "Auth header Not found"
            })
        }

        const token = authHeader.split(" ")[1]

        if (token) {
            const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY)
            console.log(decode)
            req.user = decode
            next()
        }
        else {
            return res.status(401).json({
                messsage: "Invalid user"
            })
        }

    } catch (error) {
        res.status(500).json({
            message: "internal Server Error"
        })
    }

}

export default authenticationMiddleware