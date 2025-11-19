import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Token generation failed");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({message: "User registered successfully"});
    //get user detail from frontend
    //validation - not empty
    //check if user already exists-username|email
    //check for images
    //check for avatar
    //upload avatar on cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user created successfully or not
    //send response to frontend
    const {fullName, email, username, password} = req.body
    // NOTE:request body console log karani h
    console.log("email", email);
    if (
        [fullName,email,username,password].some((field)=>
        field?.trim()===""
    )) {
        throw new ApiError(400, "All fields are required");
    }
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    if (existedUser) {
        throw new ApiError(409, "User already exists with this email/username");
    }
    // NOTE: request files console log karani h
    console.log("req.files", req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath
    if( req.files && Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0 ){
            coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar");
    }
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username:username.toLowerCase(),
        password
    })

    const craetedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!craetedUser){
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(200, craetedUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    //req-body->data
    // username \\ email
    //find user
    //password check
    //access refresh token gen
    //send cookie

    const {username , email , password} = req.body
    if (!username || !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password incorrect");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
        // sameSite: "strict",
        // maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken
        }, "User logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findById()
});

export {registerUser , loginUser, logoutUser};
// const asyncHandler = require('express-async-handler');
// const User = require('../models/user.model'); // Adjust the path to your User model
// const bcrypt = require('bcryptjs');

// // @desc    Register a new user
// // @route   POST /api/users/register
// // @access  Public
// const registerUser = asyncHandler(async (req, res) => {
//     const { name, email, password } = req.body;

//     // Validate input
//     if (!name || !email || !password) {
//         res.status(400);
//         throw new Error('Please provide all required fields');
//     }

//     // Check if user already exists
//     const userExists = await User.findOne({ email });
//     if (userExists) {
//         res.status(400);
//         throw new Error('User already exists');
//     }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create user
//     const user = await User.create({
//         name,
//         email,
//         password: hashedPassword,
//     });

//     if (user) {
//         res.status(201).json({
//             _id: user.id,
//             name: user.name,
//             email: user.email,
//         });
//     } else {
//         res.status(400);
//         throw new Error('Invalid user data');
//     }
// });

// module.exports = {
//     registerUser,
// };