const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const asyncErrorHandler = require('../middleware/asyncErrorHandler');
const sendToken = require('../utils/sendToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


exports.register = asyncErrorHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Prevent someone registering themselves as admin
    const safeRole = role === 'school_admin' ? 'school_admin' : 'student';

    const user = await User.create({
        name,
        email,
        password,
        role: safeRole
    });

    // Generate verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    user.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    await sendEmail({
        to: user.email,
        subject: 'EduGate - Verify Your Email',
        html: `
            <h2>Welcome to EduGate, ${user.name}</h2>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verifyUrl}" 
               style="background:#4F46E5;color:white;padding:12px 24px;
                      border-radius:6px;text-decoration:none;">
               Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
            <p>If you did not create this account, ignore this email.</p>
        `
    });

    res.status(201).json({
        success: true,
        message: `Verification email sent to ${user.email}`
    });
});

exports.verifyEmail = asyncErrorHandler(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        verificationToken: hashedToken,
        verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('Verification token is invalid or has expired', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
});


exports.resendVerificationEmail = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user.isVerified) {
        return next(new ErrorHandler('Email is already verified', 400));
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    user.verificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

    await sendEmail({
        to: user.email,
        subject: 'EduGate - Verify Your Email',
        html: `
            <h2>Hi ${user.name}</h2>
            <p>Here is your new verification link:</p>
            <a href="${verifyUrl}"
               style="background:#4F46E5;color:white;padding:12px 24px;
                      border-radius:6px;text-decoration:none;">
               Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
        `
    });

    res.status(200).json({
        success: true,
        message: 'Verification email resent successfully'
    });
});


exports.login = asyncErrorHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Please enter email and password', 400));
    }

    // Explicitly select password since select:false in schema
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid email or password', 401));
    }

    if (!user.isVerified) {
        return next(new ErrorHandler(
            'Please verify your email before logging in', 403
        ));
    }

    sendToken(user, 200, res);
});


exports.logout = asyncErrorHandler(async (req, res, next) => {
    res.cookie('token', null, {
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler('No user found with this email', 404));
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'EduGate - Password Reset Request',
            html: `
                <h2>Hi ${user.name}</h2>
                <p>You requested a password reset. Click below to reset:</p>
                <a href="${resetUrl}"
                   style="background:#4F46E5;color:white;padding:12px 24px;
                          border-radius:6px;text-decoration:none;">
                   Reset Password
                </a>
                <p>This link expires in 15 minutes.</p>
                <p>If you did not request this, ignore this email.</p>
            `
        });

        res.status(200).json({
            success: true,
            message: `Password reset email sent to ${user.email}`
        });

    } catch (error) {
        // If email fails, clean up tokens so user can try again
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler('Email could not be sent. Try again later', 500));
    }
});


exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler('Reset token is invalid or has expired', 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Passwords do not match', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
});


exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Current password is incorrect', 401));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler('Passwords do not match', 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
});


exports.getMyProfile = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select(
        '-verificationToken -verificationTokenExpire -resetPasswordToken -resetPasswordExpire'
    );

    res.status(200).json({
        success: true,
        user
    });
});

exports.updateProfile = asyncErrorHandler(async (req, res, next) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    };

    // If email is being changed, require re-verification
    if (req.body.email && req.body.email !== req.user.email) {
        updates.isVerified = false;

        const verificationToken = crypto.randomBytes(20).toString('hex');
        updates.verificationToken = crypto
            .createHash('sha256')
            .update(verificationToken)
            .digest('hex');
        updates.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

        const verifyUrl = 
            `${process.env.FRONTEND_URL}/verify/${verificationToken}`;

        await sendEmail({
            to: req.body.email,
            subject: 'EduGate - Verify Your New Email',
            html: `
                <h2>Hi ${req.user.name}</h2>
                <p>Please verify your new email address:</p>
                <a href="${verifyUrl}"
                   style="background:#4F46E5;color:white;padding:12px 24px;
                          border-radius:6px;text-decoration:none;">
                   Verify New Email
                </a>
            `
        });
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        user
    });
});


exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});


exports.getUserById = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

exports.updateUserRole = asyncErrorHandler(async (req, res, next) => {
    const updates = { role: req.body.role };

    const user = await User.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
    );

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        user
    });
});

exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    });
});