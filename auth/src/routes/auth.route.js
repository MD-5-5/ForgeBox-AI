import { Router } from "express";
import passport from "passport";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config()

const router = Router()


router.get('/google', passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
}))

router.get('/google/callback',passport.authenticate('google', {
    session: false,
    failureRedirect:'/'    
}), async (req,res)=>{
    try{

        const {id, displayName, photos,emails} = req.user

        let user = await User.findOne({googleId:id})

        if(!user){
            user = new User({
                googleId:id,
                displayName:displayName,
                avatar:photos?.[0]?.value,
                email:emails?.[0]?.value,
            })

            await user.save()
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"})

        res.cookie("token",token,{
            httpOnly:true
        })
        res.redirect("/")
    }
    catch(error){
        console.log("Error during Google Auth",error)
        res.redirect("/")
    }
})


export default router;