const sendToken = (user, statusCode, res) => {
    const token = user.getJWTToken();

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(Date.now() +
            process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000)
    };

    // Cookie for web, token in body for MAUI
    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            }
        });
};

module.exports = sendToken;