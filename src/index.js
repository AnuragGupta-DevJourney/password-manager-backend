import "dotenv/config"
import cors from "cors"
import express from "express"
import mongoDB_connection from "./config/db_connection.js"
import userRouter from "./routes/user.route.js"
import passwordManagerRoutes from "./routes/passwordManger.route.js"
import authenticationMiddleware from "./middleware/authentication.middleware.js"

const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.send("Server running...")
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoDB_connection()

app.use("/user", userRouter)
app.use("/auth", authenticationMiddleware, passwordManagerRoutes)

console.log(process.env.PORT)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Server Running on poert ", PORT)
})