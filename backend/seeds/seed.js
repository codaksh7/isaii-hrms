const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/isaii-hrms';

const employees = [
  { name: 'Arjun Mehta', email: 'arjun@isaii.in', department: 'Engineering', position: 'Senior Developer', phone: '9876543210', salary: 95000 },
  { name: 'Priya Sharma', email: 'priya@isaii.in', department: 'Engineering', position: 'Frontend Developer', phone: '9876543211', salary: 78000 },
  { name: 'Rahul Verma', email: 'rahul@isaii.in', department: 'Design', position: 'UI/UX Designer', phone: '9876543212', salary: 72000 },
  { name: 'Sneha Patel', email: 'sneha@isaii.in', department: 'Marketing', position: 'Marketing Lead', phone: '9876543213', salary: 82000 },
  { name: 'Vikram Singh', email: 'vikram@isaii.in', department: 'Engineering', position: 'Backend Developer', phone: '9876543214', salary: 88000 },
  { name: 'Ananya Reddy', email: 'ananya@isaii.in', department: 'HR', position: 'HR Manager', phone: '9876543215', salary: 76000 },
  { name: 'Karthik Nair', email: 'karthik@isaii.in', department: 'Engineering', position: 'DevOps Engineer', phone: '9876543216', salary: 92000 },
  { name: 'Meera Iyer', email: 'meera@isaii.in', department: 'Design', position: 'Graphic Designer', phone: '9876543217', salary: 65000 },
  { name: 'Aditya Joshi', email: 'aditya@isaii.in', department: 'Sales', position: 'Sales Executive', phone: '9876543218', salary: 58000 },
  { name: 'Divya Gupta', email: 'divya@isaii.in', department: 'Engineering', position: 'QA Engineer', phone: '9876543219', salary: 70000 },
  { name: 'Rohan Kapoor', email: 'rohan@isaii.in', department: 'Marketing', position: 'Content Writer', phone: '9876543220', salary: 52000 },
  { name: 'Ishita Das', email: 'ishita@isaii.in', department: 'HR', position: 'Recruiter', phone: '9876543221', salary: 55000 }
];

const leaveTypes = ['sick', 'casual', 'earned', 'unpaid'];
const leaveReasonsMap = {
  sick: [
    'Not feeling well, need rest',
    'Medical appointment scheduled',
    'Caught the flu, advised bed rest',
    'Severe migraine'
  ],
  casual: [
    'Family function to attend',
    'Personal work that requires my presence',
    'Home renovation supervision',
    'Attending a workshop outside office'
  ],
  earned: [
    'Traveling for personal reasons',
    'Need a mental health break',
    'Going on a family vacation'
  ],
  unpaid: [
    'Extended personal leave required',
    'Emergency at home'
  ]
};

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'ISAII Admin',
      email: 'admin@isaii.in',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
      position: 'System Administrator',
      phone: '9876500000',
      salary: 120000
    });
    console.log('Admin created: admin@isaii.in / admin123');

    const createdEmployees = [];
    for (const emp of employees) {
      const user = await User.create({
        ...emp,
        password: 'employee123',
        role: 'employee',
        joinDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
      });
      createdEmployees.push(user);
    }
    console.log(`${createdEmployees.length} employees created`);

    const attendanceRecords = [];
    const today = new Date();
    for (const emp of createdEmployees) {
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const rand = Math.random();
        let status = 'present';
        if (rand > 0.9) status = 'absent';
        else if (rand > 0.85) status = 'half-day';
        else if (rand > 0.8) status = 'late';

        const checkInHour = status === 'late' ? 10 + Math.floor(Math.random() * 2) : 9;
        const checkInMin = Math.floor(Math.random() * 30);
        const workHrs = status === 'half-day' ? 3 + Math.random() * 1.5 : status === 'absent' ? 0 : 7 + Math.random() * 2;

        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMin, 0);
        const checkOut = new Date(checkIn);
        checkOut.setHours(checkIn.getHours() + Math.floor(workHrs), Math.floor((workHrs % 1) * 60));

        attendanceRecords.push({
          user: emp._id,
          date: date.toISOString().split('T')[0],
          checkIn: status !== 'absent' ? checkIn : null,
          checkOut: status !== 'absent' ? checkOut : null,
          status,
          workHours: parseFloat(workHrs.toFixed(2))
        });
      }
    }
    await Attendance.insertMany(attendanceRecords);
    console.log(`${attendanceRecords.length} attendance records created`);

    const leaveRecords = [];
    for (const emp of createdEmployees) {
      const numLeaves = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numLeaves; i++) {
        const startOffset = Math.floor(Math.random() * 25) + 1;
        const duration = Math.floor(Math.random() * 3) + 1;
        const start = new Date(today);
        start.setDate(start.getDate() - startOffset);
        const end = new Date(start);
        end.setDate(end.getDate() + duration);

        const statuses = ['pending', 'approved', 'rejected'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
        const reasonsList = leaveReasonsMap[type];

        leaveRecords.push({
          user: emp._id,
          leaveType: type,
          startDate: start,
          endDate: end,
          totalDays: duration + 1,
          reason: reasonsList[Math.floor(Math.random() * reasonsList.length)],
          status,
          approvedBy: status !== 'pending' ? admin._id : null
        });
      }
    }
    await Leave.insertMany(leaveRecords);
    console.log(`${leaveRecords.length} leave records created`);

    console.log('\nSeeding complete!');
    console.log('Admin login: admin@isaii.in / admin123');
    console.log('Employee login: arjun@isaii.in / employee123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
