import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    username: {type: String, required: true, unique: true, minLength: 3, maxLength: 20, trim: true},
    password: {type: String, required: true, minLength: 6},
    fullName: {type: String, required: true, minLength: 3, maxLength: 50, trim: true},
    profilePic: {type: String, default:""},
    bio: {type: String, maxLength: 200},
    isPublic: {type: Boolean, default: true},
    agreedToTerms: {type: Boolean, required: true, default: false},
    lastUsernameChange: {type: Date, default: Date.now},
    friends: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    friendRequestsSent: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    friendRequestsReceived: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

export default User;