# HireFlow — Mini Applicant Tracking System (ATS)

**A modern, full-stack recruitment dashboard for managing candidates and tracking hiring progress.**

HireFlow is a web-based Applicant Tracking System (ATS) built to simplify candidate management. It helps recruiters organize applicants, search candidate profiles, update hiring stages, and monitor recruitment progress through a centralized dashboard.

🔗 **Live Demo:** [HireFlow ATS](https://mini-ats-hireflow.netlify.app/)  
💻 **Source Code:** [GitHub Repository](https://github.com/Sawantkr/mini-ats)

---

## ✨ Key Features

- **Recruitment Dashboard** — View candidate statistics and hiring pipeline metrics.
- **Candidate Management** — Add new candidates and manage existing applicant records.
- **Search Candidates** — Find candidates by name, email, or job title.
- **Hiring Stage Tracking** — Update candidates across Applied, Screening, Interview, Selected, and Rejected stages.
- **Stage Filtering** — Filter the candidate list by hiring stage.
- **Candidate Deletion** — Remove candidate records when needed.
- **CSV Export** — Export candidate information for reporting and further analysis.
- **Persistent Data Storage** — Store candidate records in MongoDB Atlas through a REST API.
- **Responsive Interface** — Navigate the recruitment workspace through a clean, dashboard-oriented UI.
- **Live Deployment** — Frontend and backend deployed separately.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| API | REST API |
| Deployment | Netlify, Render |
| Version Control | Git, GitHub |

## 🏗️ Architecture

HireFlow follows a client-server architecture.

```text
                 Recruiter
                     |
                     v
          React Frontend (Vite)
             Hosted on Netlify
                     |
                     | HTTP / REST API
                     v
            Express.js Backend
               Hosted on Render
                     |
                     | Mongoose
                     v
              MongoDB Atlas
          Persistent Candidate Data
```

**How it works:**

1. The recruiter interacts with the React frontend.
2. The frontend sends HTTP requests to the Express.js API.
3. The backend validates and processes candidate operations.
4. Mongoose communicates with MongoDB Atlas.
5. API responses update the frontend and dashboard.

## 📊 Dashboard Capabilities

The dashboard summarizes the recruitment pipeline, including:

- Total candidates
- Candidates in screening
- Candidates in the interview stage
- Selected candidates
- Candidate distribution across hiring stages

These metrics help recruiters understand the current state of their hiring pipeline at a glance.

## 🚀 Getting Started

Follow these steps to run HireFlow locally.

### Prerequisites

Install the following:

- Node.js and npm
- Git
- A MongoDB Atlas account or another compatible MongoDB deployment

### 1. Clone the Repository

```bash
git clone https://github.com/Sawantkr/mini-ats.git
cd mini-ats
```

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholder with your own MongoDB connection string. Never commit real credentials to GitHub.

Start the backend:

```bash
npm run dev
```

The API should start on `http://localhost:5000`, provided the database connection succeeds.

### 3. Configure the Frontend

Open a second terminal:

```bash
cd client
npm install
```

Create a `.env` file inside `client`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### 4. Verify the Backend

Open this endpoint in your browser:

```text
http://localhost:5000/api/health
```

A successful response confirms that the API health endpoint is running.

## 🔌 API Overview

The application uses REST endpoints for candidate management and dashboard statistics.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API health |
| GET | `/api/candidates` | Retrieve candidates |
| POST | `/api/candidates` | Create a candidate |
| PUT | `/api/candidates/:id` | Update candidate details or hiring stage |
| DELETE | `/api/candidates/:id` | Delete a candidate |
| GET | `/api/dashboard/stats` | Retrieve dashboard statistics |

The candidate listing supports search and hiring-stage filtering through query parameters.

## 🧪 Testing the Application

Use the following checklist to verify the main workflow:

- [ ] Open the dashboard and verify candidate statistics.
- [ ] Add a candidate with valid details.
- [ ] Search by candidate name, email, or job title.
- [ ] Filter candidates by hiring stage.
- [ ] Change a candidate's stage and verify the update.
- [ ] Delete a test candidate.
- [ ] Export candidate data as CSV.
- [ ] Refresh the page and verify that saved records persist.

## 🔐 Security Considerations

- Keep MongoDB connection strings and credentials in environment variables.
- Never commit `.env` files or API secrets to the repository.
- Validate and sanitize incoming API data on the backend.
- Restrict database access and configure appropriate CORS policies.
- Use authentication and role-based authorization before exposing the platform to multiple real recruiters or students.

## 📈 Future Improvements

Potential enhancements for a more complete recruitment platform include:

- Student and recruiter authentication
- Job creation and publishing
- Student applications and application tracking
- Resume uploads and profile management
- Interview scheduling and email notifications
- Company verification and administrator tools
- Automated tests, monitoring, and load testing

These are future enhancements, not claims about the current implementation.

## 👨‍💻 Author

**Sawant Kumar Sawant**

B.Tech — Electronics and Communication Engineering

- GitHub: [@Sawantkr](https://github.com/Sawantkr)
- Project: [HireFlow ATS](https://mini-ats-hireflow.netlify.app/)

---

*HireFlow was developed as a full-stack project to demonstrate candidate management, REST API integration, database persistence, and recruitment dashboard workflows.*
