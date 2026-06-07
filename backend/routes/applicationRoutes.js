const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController')
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/authMiddleware');


router.get('/', isAuthenticatedUser, authorizeRoles('admin', 'school_admin', 'student'), applicationController.getApplications)
router.get('/:id', isAuthenticatedUser, authorizeRoles('admin', 'school_admin', 'student'), applicationController.getApplicationById)

router.post('/', isAuthenticatedUser, authorizeRoles('student'), applicationController.createApplication)

router.put('/:id', isAuthenticatedUser, authorizeRoles('student'), applicationController.updateApplication)
router.patch('/:id/status', isAuthenticatedUser, authorizeRoles('admin', 'school_admin'), applicationController.updateApplicationStatus)

router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin', 'student'), applicationController.deleteApplication)

module.exports = router;