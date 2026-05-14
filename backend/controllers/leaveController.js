const Leave = require('../models/Leave');

exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const overlapping = await Leave.findOne({
      user: req.user._id,
      status: { $ne: 'rejected' },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ success: false, message: 'You already have a leave request for these dates' });
    }

    const leave = await Leave.create({
      user: req.user._id,
      leaveType, startDate: start, endDate: end,
      totalDays, reason
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('user', 'name email department position')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This leave request has already been processed' });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    if (adminRemarks) leave.adminRemarks = adminRemarks;

    await leave.save();
    await leave.populate('user', 'name email department position');

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLeaveSummary = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'employee') {
      query.user = req.user._id;
    }

    const leaves = await Leave.find(query);

    const summary = {
      total: leaves.length,
      pending: leaves.filter(l => l.status === 'pending').length,
      approved: leaves.filter(l => l.status === 'approved').length,
      rejected: leaves.filter(l => l.status === 'rejected').length,
      byType: {
        sick: leaves.filter(l => l.leaveType === 'sick').length,
        casual: leaves.filter(l => l.leaveType === 'casual').length,
        earned: leaves.filter(l => l.leaveType === 'earned').length,
        unpaid: leaves.filter(l => l.leaveType === 'unpaid').length
      }
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, user: req.user._id, status: 'pending' });
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found or cannot be deleted' });
    }
    await Leave.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Leave request deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
