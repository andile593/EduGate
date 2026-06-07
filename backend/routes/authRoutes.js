const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authMiddleware');


router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', isAuthenticatedUser, authController.logout)

router.post('/password/forgot', authController.forgotPassword)
router.put('/password/reset/:token', authController.resetPassword)
router.put('/password/update', isAuthenticatedUser, authController.updatePassword)

router.get('/verify/:token', authController.verifyEmail)
router.post('/verify/resend', isAuthenticatedUser, authController.resendVerificationEmail)

router.get('/me', isAuthenticatedUser, authController.getMyProfile)
router.put('/me/update', isAuthenticatedUser, authController.updateProfile)

router.get('/admin/users', isAuthenticatedUser, authorizeRoles('admin'), authController.getAllUsers)
router.get('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), authController.getUserById)
router.put('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), authController.updateUserRole)
router.delete('/admin/users/:id', isAuthenticatedUser, authorizeRoles('admin'), authController.deleteUser)

module.exports = router;