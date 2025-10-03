import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({message: "User registered successfully"});
})


export {registerUser};
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