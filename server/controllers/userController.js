import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import cloudinary from '../lib/cloudinary.js';


// Sign up new User using model {User.js}
export const signup = async (req, res) => {
    const {fullName, username, email, password, bio, agreedToTerms} = req.body;

    try {
        if(!fullName || !username || !email || !password || !bio) {
            return res.json({success: false, message: "Please fill all the fields"});
        }

        // Validate full name
        if(fullName.trim().length < 3) {
            return res.json({success: false, message: "Full name must be at least 3 characters"});
        }
        if(fullName.length > 50) {
            return res.json({success: false, message: "Full name must be less than 50 characters"});
        }

        // Validate username
        if(username.trim().length < 3) {
            return res.json({success: false, message: "Username must be at least 3 characters"});
        }
        if(username.length > 20) {
            return res.json({success: false, message: "Username must be less than 20 characters"});
        }
        // Check username format (alphanumeric, underscore, hyphen only)
        if(!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return res.json({success: false, message: "Username can only contain letters, numbers, underscores, and hyphens"});
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.json({success: false, message: "Please enter a valid email address"});
        }

        // Validate password
        if(password.length < 6) {
            return res.json({success: false, message: "Password must be at least 6 characters"});
        }

        // Validate bio
        if(bio.length > 200) {
            return res.json({success: false, message: "Bio must be less than 200 characters"});
        }

        // Check if user agreed to terms and conditions
        if(!agreedToTerms) {
            return res.json({success: false, message: "You must agree to the terms and conditions"});
        }

        // Check if email already exists
        const existingEmail = await User.findOne({email: email.toLowerCase()});
        if(existingEmail){
            return res.json({success: false, message: "Email already exists"});
        }

        // Check if username already exists (case-sensitive exact match)
        const existingUsername = await User.findOne({username: username});
        if(existingUsername){
            return res.json({success: false, message: "Username already taken"});
        }

        // Create new user, if does not exist
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            bio,
            agreedToTerms: true,
            lastUsernameChange: Date.now()
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
        const {profilePic, fullName, username, bio, isPublic} = req.body;
        if(!fullName || !bio) {
            return res.json({success: false, message: "Please fill all the fields"});
        }

        // Validate full name
        if(fullName.trim().length < 3) {
            return res.json({success: false, message: "Full name must be at least 3 characters"});
        }
        if(fullName.length > 50) {
            return res.json({success: false, message: "Full name must be less than 50 characters"});
        }

        // Validate bio
        if(bio.length > 200) {
            return res.json({success: false, message: "Bio must be less than 200 characters"});
        }

        const userId = req.user._id;
        const currentUser = await User.findById(userId);

        // Check if username is being changed
        if(username && username !== currentUser.username) {
            // Validate username format
            if(username.trim().length < 3) {
                return res.json({success: false, message: "Username must be at least 3 characters"});
            }
            if(username.length > 20) {
                return res.json({success: false, message: "Username must be less than 20 characters"});
            }
            if(!/^[a-zA-Z0-9_-]+$/.test(username)) {
                return res.json({success: false, message: "Username can only contain letters, numbers, underscores, and hyphens"});
            }

            // Check if 30 days have passed since last username change
            const daysSinceLastChange = Math.floor((Date.now() - new Date(currentUser.lastUsernameChange).getTime()) / (1000 * 60 * 60 * 24));
            
            if(daysSinceLastChange < 30) {
                const daysRemaining = 30 - daysSinceLastChange;
                return res.json({success: false, message: `You can change your username again in ${daysRemaining} days`});
            }

            // Check if new username is already taken (case-sensitive exact match)
            const existingUsername = await User.findOne({
                username: username,
                _id: {$ne: userId}
            });
            
            if(existingUsername){
                return res.json({success: false, message: "Username already taken"});
            }
        }

        let updatedUser;
        const updateData = {
            bio, 
            fullName,
            isPublic: isPublic !== undefined ? isPublic : currentUser.isPublic,
            ...(username && username !== currentUser.username && {username, lastUsernameChange: Date.now()})
        };

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, updateData, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, {...updateData, profilePic: upload.secure_url}, {new: true});
        }

        res.json({success: true, user: updatedUser, message: "Profile updated successfully"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}


// Controller to check username availability
export const checkUsernameAvailability = async (req, res) => {
    const {username} = req.body;

    try {
        if(!username) {
            return res.json({success: false, message: "Username is required"});
        }

        // Validate username format
        if(username.trim().length < 3) {
            return res.json({success: false, message: "Username must be at least 3 characters"});
        }
        if(username.length > 20) {
            return res.json({success: false, message: "Username must be less than 20 characters"});
        }
        if(!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return res.json({success: false, message: "Username can only contain letters, numbers, underscores, and hyphens"});
        }

        // Check if username already exists (case-sensitive exact match)
        const existingUsername = await User.findOne({username: username});
        if(existingUsername){
            return res.json({success: false, message: "Username already taken"});
        }

        res.json({success: true, message: "Username is available"});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}