# JobLink

A comprehensive job recommendation and hiring platform designed to connect job seekers with relevant opportunities and empower companies with intelligent recruiting tools.

**Repository:** [github.com/IRIvey/JobLink](https://github.com/IRIvey/JobLink.git)

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Project Architecture](#project-architecture)
- [Team Contributions](#team-contributions)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Overview

JobLink is a full-stack web application that bridges the gap between job seekers and employers. The platform leverages skill-based matching, AI-powered candidate evaluation, and real-time analytics to streamline the hiring process for both sides.

The application features:
- **Role-based profiles** for job seekers and companies
- **Intelligent job recommendations** based on skill matching
- **Comprehensive application management** system
- **AI-assisted candidate evaluation** and summarization
- **Real-time hiring analytics** and insights
- **Professional resume builder** with PDF export

---

## Problem Statement

### Current Challenges

1. **Job Seekers:** Difficulty finding opportunities that match their specific skills and qualifications
2. **Companies:** High volume of irrelevant applications, consuming valuable recruiting resources
3. **Resume Creation:** Manual CV creation is time-consuming and inconsistent
4. **Communication:** Inefficient, fragmented communication throughout the hiring pipeline

### JobLink's Solution

JobLink addresses these pain points through:
- Automated skill-based job matching to connect qualified candidates with relevant positions
- Streamlined application workflows that reduce irrelevant submissions
- Integrated resume builder for fast, professional CV creation
- Centralized communication and application management within a single platform

---

## Key Features

### For Job Seekers

| Feature | Description |
|---------|-------------|
| **Dashboard** | Track applied jobs, monitor application statuses, and view personalized recommendations |
| **Profile Management** | Build comprehensive profiles including skills, education, and work experience |
| **Smart Job Search** | Discover jobs with fuzzy search and skill-based recommendations |
| **Resume Builder** | Create professional CVs with tailored templates and download as PDF |
| **Application Tracking** | Monitor real-time status updates (Applied, Shortlisted, Rejected, Selected) |

### For Companies

| Feature | Description |
|---------|-------------|
| **Dashboard** | Monitor active job posts, applicant counts, and hiring progress at a glance |
| **Job Posting** | Create and publish job listings with specific skill requirements |
| **Applicant Management** | View, shortlist, reject, and select candidates per job post |
| **AI Application Summary** | Receive AI-generated candidate summaries to accelerate evaluation |
| **Analytics & Insights** | Access real-time hiring statistics, match scores, and recruitment trends |

### Cross-Platform

| Feature | Description |
|---------|-------------|
| **Role-Based Access Control** | Separate, secure login flows for job seekers and companies |
| **Responsive Design** | Seamless experience across desktop and mobile devices |

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** bcrypt.js (password hashing)
- **Database:** MongoDB

### Frontend
- **Framework:** React.js
- **Languages:** HTML5, CSS3, JavaScript (ES6+)
- **Additional Tools:** React components for UI, resume PDF generation library

### DevOps & Tools
- **Containerization:** Docker
- **Version Control:** Git and GitHub
- **Development Environment:** VS Code

---

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB instance (local or cloud-based)
- Git

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/IRIvey/JobLink.git
cd JobLink

# Install backend dependencies
npm install

# Configure environment variables
# Create a .env file with the following:
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
BCRYPT_ROUNDS=10

# Start the backend server
npm start
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd client

# Install frontend dependencies
npm install

# Configure API endpoint
# Update the API base URL in your React configuration

# Start the development server
npm start
```

The application will be available at `http://localhost:3000`

### Docker Setup (Optional)

```bash
# Build and run with Docker
docker-compose up --build
```

---

## Project Architecture

### Database Schema

JobLink uses MongoDB with the following primary collections:

- **Users** – Job seekers and companies with authentication details
- **Jobs** – Job postings with required skills and descriptions
- **Applications** – Application records with status tracking
- **Profiles** – Extended user profiles (education, experience, skills)
- **Resumes** – Saved resume data for PDF generation
- **Analytics** – Aggregated hiring metrics and statistics

### Key Workflows

**Job Seeker Flow:**
```
Profile Creation → Skill Definition → Job Search → Apply → Track Status
```

**Company Flow:**
```
Company Profile → Job Posting → Review Applications → AI Summary → Shortlist → Hire
```

**Recommendation System:**
- Analyzes job seeker skills against job requirements
- Ranks jobs by match score
- Surfaces top recommendations in the dashboard

---

## Team Contributions

### Israt Risha Ivey (220042103)

- **JobSeeker Dashboard:** Implemented job tracking and status monitoring
- **Job Search System:** Built skill-based recommendation engine with fuzzy search integration
- **Job Posting:** Contributed to company-side job creation functionality
- **Analytics Dashboard:** Developed real-time hiring statistics and visualizations

### Zannatul Adon Sabiha (220042123)

- **Resume Builder:** Designed input forms and integrated PDF generation
- **Dashboards:** Developed both JobSeeker and Company dashboard interfaces
- **Profile Management:** Implemented job seeker profile forms and workflows
- **AI Application Summary:** Integrated AI-powered candidate summarization feature

### Tanzia Rahman (220042129)

- **Company Dashboard:** Built hiring team interface with applicant pipeline visibility
- **Company Profile Management:** Designed company profile forms and data persistence
- **Job Posting System:** Implemented job listing creation and management
- **Database Design:** Architected MongoDB schema and entity relationships

---

## Future Enhancements

### Short Term
- **Advanced Candidate Ranking:** Extend AI summaries to automatically score applicants based on job requirements
- **Real-Time Chat:** Implement in-app messaging between companies and applicants
- **Interview Scheduling:** Add calendar integration with automated reminders

### Medium Term
- **ML-Powered Recommendations:** Enhance matching algorithm by learning from user behavior patterns
- **External Job Board Integration:** Aggregate listings from popular job platforms to expand opportunities
- **Email Notifications:** Automated alerts for application updates and new matching jobs

### Long Term
- **Video Interview Integration:** Built-in video interview tools and recordings
- **Skill Assessment Platform:** Incorporate technical assessments and coding challenges
- **Enterprise Features:** Role-based access control, team management, and custom workflows

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## Project Information

- **Academic Supervisor:** Jibon Naher, Lecturer, CSE
- **Industrial Supervisor:** Maheen Mashrur Haque
- **Application Domain:** Recruitment and HR systems, Job marketplace platforms, Skill-based matching
- **Status:** Completed DP-I Project

---

## License

This project is part of an academic curriculum at the Department of Computer Science and Engineering.

---

## Contact & Support

For issues, feature requests, or questions, please open an issue on the [GitHub repository](https://github.com/IRIvey/JobLink.git).

---

**Last Updated:** April 2026 | **Version:** 1.0
