import "dotenv/config"
import express from "express"
import morgan from "morgan"
import jwt from "jsonwebtoken"
import passport from "passport"
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import cors from "cors"
import cookies from "cookie-parser"


import authRouter from "./routes/auth.route.js"

const app = express()

app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize())


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
        },
        (accessToken,refreshToken,profile,done)=>{
            

            return done(null,profile)
        }
    )
)

app.get("/_status/healthz",(req,res)=>{
    res.status(200).json({status:'ok'});
});

app.get("/_status/readyz",(req,res)=>{
    res.status(200).json({ status:"ready"});
})

app.use('/api/auth',authRouter)

export default app