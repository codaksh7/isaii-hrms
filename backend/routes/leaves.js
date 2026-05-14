const express = require('express');
const router = express.Router();
const {
  applyLeave, getLeaves, updateLeaveStatus,
  getLeaveSummary, deleteLeave
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getLeaves)
  .post(applyLeave);
router.get('/summary', getLeaveSummary);
router.put('/:id', authorize('admin'), updateLeaveStatus);
router.delete('/:id', deleteLeave);

module.exports = router;
