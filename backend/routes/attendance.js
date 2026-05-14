const express = require('express');
const router = express.Router();
const {
  checkIn, checkOut, getAttendance,
  getTodayStatus, getAttendanceSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/summary', getAttendanceSummary);
router.get('/', getAttendance);

module.exports = router;
