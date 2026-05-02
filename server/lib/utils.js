import jwt from 'jsonwebtoken';

// Function to generate Token using JWT
export const generateToken = (userId) => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    return token;
}

// Remove sensitive fields before returning a user object in API responses.
export const sanitizeUser = (userDoc) => {
    const user = userDoc?.toObject ? userDoc.toObject() : userDoc;
    if (!user) return null;

    const { password, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;
    return safeUser;
}

export const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000
});