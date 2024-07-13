const express = require('express');
const { registerStudent } = require('../controllers/applicationController')
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.route('/new-student').get(isAuthenticatedUser, registerStudent)

export default router;