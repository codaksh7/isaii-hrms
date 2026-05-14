const express = require('express');
const router = express.Router();
const {
  getEmployees, getEmployee, addEmployee,
  updateEmployee, deleteEmployee, getDepartments
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/departments', getDepartments);
router.route('/')
  .get(getEmployees)
  .post(authorize('admin'), addEmployee);
router.route('/:id')
  .get(getEmployee)
  .put(authorize('admin'), updateEmployee)
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
