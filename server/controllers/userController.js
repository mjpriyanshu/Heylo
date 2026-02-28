import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';


// Sign up new User using model {User.js}
export const signup = async (req, res) => {
    const {fullName, email, password, bio} = req.body;

    try {
        if(!fullName || !email || !password || !bio) {
            return res.json({success: false, message: "Please fill all the fields"});
        }

        // Check if user already exists
        const user = await User.findOne({email});
        if(user){
            return res.json({success: false, message: "User already exists"});
        }

        // Create new user, if does not exist
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id);
        res.json({success: true, userData: newUser, token,  message: "User Account created successfully"});
    } catch (error) {
        res.json({success: false, message: error.message});
        console.log(error.message);

    }
}



// Login User using model {User.js}
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await User.findOne({email});
        if(!userData) {
            return res.json({success: false, message: "User does not exist"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if(!isPasswordCorrect) {
            return res.json({success: false, message: "Incorrect Password"});
        }

        const token = generateToken(userData._id);
        res.json({success: true, userData, token, message: "User logged in successfully"});


    } catch (error) {
        res.json({success: false, message: error.message});
        console.log(error.message);
    }
}



// Controller to check if user is authenticated using middleware {auth.js}
export const checkAuth = (req, res) => {
    res.json({success: true, user: req.user});
}



// Controller to update user profile using Cloudinary {lib/cloudinary.js}
export const updateProfile = async (req, res) => {
    try {
        const {profilePic, fullName, bio} = req.body;
        if(!fullName || !bio) {
            return res.json({success: false, message: "Please fill all the fields"});
        }

        const userId = req.user._id;
        let updatedUser;
        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }

        res.json({success: true, user: updatedUser, message: "Profile updated successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}