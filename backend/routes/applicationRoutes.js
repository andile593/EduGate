const express = require('express');
const { createApplication } = require('../controllers/applicationController')
const { isAuthenticatedUser } = require('../middleware/auth');

const router = express.Router();

router.route('/new-student').get(isAuthenticatedUser, createApplication)

module.exports = router;