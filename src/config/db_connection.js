
import mongoose from "mongoose";
import "dotenv/config"

async function mongoDB_connection() {
    
    // const db_url = "mongodb://localhost:27017/"
    // const db_name = "ref-and-populate-testing"

    try {
    
        const response = await mongoose.connect(`${process.env.MONGO_DB_ATLAS_URL}`)

        console.log("db connecte" , response.connection._connectionString)


    } catch (error) {
        console.log("internal error")
    }

}

export default mongoDB_connection