import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new Error(401,"Unauthorized access - token missing")
        }
    
        const decodedtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken")
        if(!user){
            throw new Error(401,"Unauthorized access - user not found")
        }
        // TODO disscuss about frontend in next video
        req.user = user;
        next();
    } catch (error) {
        throw new Error(401,error?.message || "Unauthorized access - invalid token")
    }
})