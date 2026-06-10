import { verifyToken } from "../utils.js";

export function authMiddleware(req,res,next){
    const token = req.cookies.token
    console.log("Auth Middleware hit", token)
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    const decodedToken = verifyToken(token)
    if(!decodedToken){
        return res.status(401).json({message:"Unauthorized"})
    }
    req.user = decodedToken.id
    next()
}
