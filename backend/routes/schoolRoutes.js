const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', schoolController.getSchools)
router.get('/:id', schoolController.getSchoolById)

router.post('/', isAuthenticatedUser, authorizeRoles('admin', 'school_admin'), schoolController.createSchool)
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin', 'school_admin'), schoolController.updateSchool)
router.put('/admin/:id/verify', isAuthenticatedUser, authorizeRoles('admin'), schoolController.verifySchool)

router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), schoolController.deleteSchool)


module.exports = router;