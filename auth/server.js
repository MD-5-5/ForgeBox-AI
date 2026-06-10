import app from "./src/app.js";
import { connectToDB } from "./src/config/db.js"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
import cors from "cors"
app.use(cookieParser())
app.use(cors())

connectToDB()
app.listen(3000,()=>{
    console.log("Auth Server is running on port 3000")
})
