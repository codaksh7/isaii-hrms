const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    if (req.user.role === 'admin') {
      const totalEmployees = await User.countDocuments({ role: 'employee' });
      const activeEmployees = await User.countDocuments({ role: 'employee', isActive: true });

      const todayAttendance = await Attendance.countDocuments({ date: today, status: 'present' });
      const monthAttendance = await Attendance.find({
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      const approvedLeaves = await Leave.countDocuments({
        status: 'approved',
        startDate: { $gte: new Date(startOfMonth) },
        endDate: { $lte: new Date(endOfMonth) }
      });

      const recentLeaves = await Leave.find()
        .populate('user', 'name department position')
        .sort({ createdAt: -1 })
        .limit(5);

      const recentEmployees = await User.find({ role: 'employee' })
        .sort({ createdAt: -1 })
        .limit(5);

      const departmentStats = await User.aggregate([
        { $match: { role: 'employee' } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const monthlyPresent = monthAttendance.filter(a => a.status === 'present').length;
      const monthlyAbsent = monthAttendance.filter(a => a.status === 'absent').length;
      const monthlyHalfDay = monthAttendance.filter(a => a.status === 'half-day').length;

      res.status(200).json({
        success: true,
        data: {
          employees: { total: totalEmployees, active: activeEmployees },
          attendance: {
            today: todayAttendance,
            monthly: { present: monthlyPresent, absent: monthlyAbsent, halfDay: monthlyHalfDay, total: monthAttendance.length }
          },
          leaves: { pending: pendingLeaves, approved: approvedLeaves },
          recentLeaves,
          recentEmployees,
          departmentStats
        }
      });
    } else {
      const myAttendance = await Attendance.find({
        user: req.user._id,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const todayAttendance = await Attendance.findOne({ user: req.user._id, date: today });

      const myLeaves = await Leave.find({ user: req.user._id });
      const recentLeaves = await Leave.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5);

      res.status(200).json({
        success: true,
        data: {
          attendance: {
            today: todayAttendance,
            monthly: {
              present: myAttendance.filter(a => a.status === 'present').length,
              absent: myAttendance.filter(a => a.status === 'absent').length,
              halfDay: myAttendance.filter(a => a.status === 'half-day').length,
              total: myAttendance.length
            }
          },
          leaves: {
            pending: myLeaves.filter(l => l.status === 'pending').length,
            approved: myLeaves.filter(l => l.status === 'approved').length,
            rejected: myLeaves.filter(l => l.status === 'rejected').length,
            total: myLeaves.length
          },
          recentLeaves
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
