import jwt from 'jsonwebtoken';

// Function to generate Token using JWT
export const generateToken = (userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}