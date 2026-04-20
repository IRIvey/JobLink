# JobLink

A role-based job recommendation and hiring platform that matches job seekers with companies through skill-based filtering, AI-powered candidate summaries, and a full end-to-end application pipeline.

## Features

- Separate auth flows and dashboards for **Job Seekers** and **Companies**
- **Skill-based job recommendations** with fuzzy search support
- **Application pipeline** — apply, shortlist, reject, hire with live status updates
- **AI-generated candidate summaries** for faster company-side evaluation
- **Resume builder** with downloadable PDF export
- **Analytics dashboard** with real-time hiring stats and match scores
- Interview scheduling and notification system

## Tech Stack

- **Frontend** — React.js, Vite
- **Backend** — Node.js, Express.js
- **Database** — MongoDB
- **AI** — Google Gemini API
- **Containerization** — Docker, Docker Compose

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose installed

### Setup

```bash
git clone https://github.com/IRIvey/JobLink.git
cd JobLink
```

Create a `.env` file in the `server/` directory:

```env
MONGODB_URI=your_mongodb_uri
PORT=5001
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM_NAME=Job Portal
```

### Run

```bash
docker-compose down && docker-compose up -d --build
docker restart joblink-server-1
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5001 |
| MongoDB | localhost:27017 |

## Team

| Name | Student ID |
|---|---|
| Israt Risha Ivey | 220042103 |
| Zannatul Adon Sabiha | 220042123 |
| Tanzia Rahman | 220042129 |

