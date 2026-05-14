<div align="center">

  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/zap.svg" alt="ISAII Logo" width="80" height="80" />

  <h1 align="center">ISAII Ops HRMS</h1>

  <p align="center">
    <strong>A Premium, High-Fidelity Human Resource Management Suite</strong>
    <br />
    Crafted exclusively for Team ISAII with cinematic animations, robust role-based access, and a dark-mode-first aesthetic.
  </p>

  <p align="center">
    <a href="https://isaii-daksh.vercel.app"><strong>View Live Demo (Frontend)</strong></a>
    ·
    <a href="https://github.com/codaksh7/isaii-hrms/issues">Report Bug</a>
    ·
    <a href="https://github.com/codaksh7/isaii-hrms/issues">Request Feature</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  </p>

</div>

<br />

## ✦ Core Features

<table align="center" width="100%">
  <tr>
    <td width="50%" valign="top">
      <h3><img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg" width="20" align="top" /> Role-Based Architecture</h3>
      <p>Strict segregation between Admin and Employee roles with JWT authentication. Admins command the entire fleet; Employees manage their localized workflows.</p>
    </td>
    <td width="50%" valign="top">
      <h3><img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/clock.svg" width="20" align="top" /> Dynamic Attendance</h3>
      <p>Interactive flip-clock attendance tracking. Employees can clock-in/out in real-time with comprehensive historical data filtering.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3><img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/users.svg" width="20" align="top" /> Employee Directory</h3>
      <p>Complete CRUD capabilities for admins. Dynamically assign custom departments and manage personnel with interactive animated modals.</p>
    </td>
    <td width="50%" valign="top">
      <h3><img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/calendar-days.svg" width="20" align="top" /> Leave Management</h3>
      <p>Employees request logical leave types (Sick, Casual, Earned) with intelligent dynamic reasoning. Admins review and approve/reject instantly.</p>
    </td>
  </tr>
</table>

## ✦ Design Philosophy

This project rejects standard corporate templates. It is engineered with a **dark-mode-first** methodology, prioritizing deep navy and charcoal hues. Micro-interactions are powered by **Framer Motion**, delivering fluid physics-based animations, canvas particle effects, and premium typography for an unparalleled "wow" factor.

<br />

## ✦ Architecture Overview

The system is built on a scalable **MERN** stack, separated into two distinct environments:

### 1. The Frontend (`/frontend`)
- **Framework**: React 18 powered by Vite.
- **Routing**: `react-router-dom` with strict protected routes.
- **State Management**: Context API (`AuthContext`).
- **Aesthetics**: Vanilla CSS tokens & Framer Motion.
- **Iconography**: Premium `lucide-react` SVG icon set.

### 2. The Backend (`/backend`)
- **Server**: Node.js & Express.
- **Database**: MongoDB Atlas via Mongoose ODMs.
- **Security**: Stateless JSON Web Tokens (JWT) & bcrypt password hashing.
- **Seeding**: Automated mock data generation for immediate presentation readiness.

<br />

## ✦ Local Development Guide

To run this platform locally, follow these precise steps:

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster URI

### Installation

**1. Clone the repository:**
```bash
git clone https://github.com/codaksh7/isaii-hrms.git
cd isaii-hrms
```

**2. Setup the Backend:**
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
```
Seed the database with presentation data:
```bash
npm run seed
```
Start the server:
```bash
npm run dev
```

**3. Setup the Frontend:**
```bash
cd ../frontend
npm install
npm run dev
```

The application will launch at `http://localhost:5173`. 

<br />

## ✦ Demo Access

For immediate access to the deployed platform, utilize the Quick Access module on the login screen or use the following credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@isaii.in` | `admin123` |
| **Employee** | `arjun@isaii.in` | `employee123` |

<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/terminal-square.svg" width="24" />
  <p><i>Engineered for Performance. Designed for Excellence.</i></p>
</div>
