const express = require('express');
const router = express.Router();
const coursController = require('../../controllers/coursController');
const verifyJWT = require('../../middleware/verifyJWT');
const optionalJWT = require('../../middleware/optionalJWT');

router.get('/', optionalJWT, coursController.getAllCourses);
router.get('/enrolled', verifyJWT, coursController.getEnrolledCourses);
router.get('/:id', verifyJWT, coursController.getCourseById);
router.post('/', verifyJWT, coursController.createCourse);
router.put('/:id', verifyJWT, coursController.updateCourse);
router.delete('/:id', verifyJWT, coursController.deleteCourse);
router.post('/:id/enroll', verifyJWT, coursController.enrollCourse);

module.exports = router;
