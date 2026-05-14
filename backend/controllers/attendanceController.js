const Attendance = require('../models/Attendance');

const getTodayStr = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

exports.checkIn = async (req, res) => {
  try {
    const today = getTodayStr();
    const existing = await Attendance.findOne({ user: req.user._id, date: today });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const attendance = await Attendance.create({
      user: req.user._id,
      date: today,
      checkIn: new Date(),
      status: 'present'
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const today = getTodayStr();
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'No check-in found for today' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    attendance.checkOut = new Date();
    const diffMs = attendance.checkOut - attendance.checkIn;
    attendance.workHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    if (attendance.workHours < 4) {
      attendance.status = 'half-day';
    }

    await attendance.save();
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { userId, startDate, endDate, page = 1, limit = 30 } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      query.user = req.user._id;
    } else if (userId) {
      query.user = userId;
    }

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.date = { $gte: startDate };
    } else if (endDate) {
      query.date = { $lte: endDate };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('user', 'name email department position')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: records,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTodayStatus = async (req, res) => {
  try {
    const today = getTodayStr();
    const attendance = await Attendance.findOne({ user: req.user._id, date: today });
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0];
    const endDate = new Date(targetYear, targetMonth + 1, 0).toISOString().split('T')[0];

    const query = { date: { $gte: startDate, $lte: endDate } };

    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }

    const records = await Attendance.find(query);

    const summary = {
      totalDays: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      late: records.filter(r => r.status === 'late').length,
      avgWorkHours: records.length > 0
        ? parseFloat((records.reduce((sum, r) => sum + r.workHours, 0) / records.length).toFixed(2))
        : 0
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
