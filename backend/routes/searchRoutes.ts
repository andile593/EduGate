import { Router } from 'express'
const router = Router()

const { getSchools } = require('../controllers/searchController')

router.route('/').get(getSchools)

export default router;