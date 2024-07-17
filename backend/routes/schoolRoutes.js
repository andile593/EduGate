const express = require('express');
const { getAllSchools, getSchoolDetails, updateSchool, deleteSchool, createSchool, getAdminSchools, getSchools } = require('../controllers/schoolsController');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.route('/schools').get(getAllSchools);
router.route('/schools/all').get(getSchools);

router.route('/admin/schools').get(isAuthenticatedUser, authorizeRoles("admin"), getAdminSchools);
router.route('/admin/school/new').post(isAuthenticatedUser, authorizeRoles("admin"), createSchool);

router.route('/admin/school/:id')
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateSchool)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSchool);

router.route('/schools/:id').get(getSchoolDetails);


module.exports = router;