# TaskFlow — Task Management + Analytics Dashboard

> A full-stack productivity app for managing tasks, tracking progress, and visualizing your workflow with real-time analytics.

## Live Demo

[🔗 View Live App](#) <!-- Replace with your Vercel URL -->

---

## The Problem It Solves

Most people track tasks in scattered notes, spreadsheets, or apps that give no insight into their productivity patterns. TaskFlow brings everything into one place — create and manage tasks, see their completion trends over time, and export data whenever you need it.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS |
| Charts | Chart.js + react-chartjs-2 |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| CSV Export | json2csv |
| Notifications | react-hot-toast |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

- **Auth** — Secure signup/login with JWT authentication and protected routes
- **Task CRUD** — Create, edit, delete, and filter tasks by status
- **Status Tracking** — Mark tasks as pending, in-progress, or completed
- **Analytics Charts** — Bar chart (tasks by status) + Line chart (completions over last 7 days)
- **CSV Export** — Download all your tasks as a `.csv` file
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Toast Notifications** — Success/error feedback on every action
- **Loading States** — Spinners on async operations

---

## Screenshots

> _Add screenshots here after deployment_

| Login | Dashboard | Analytics |
|-------|-----------|-----------|
| ![Login](#) | ![Dashboard](#) | ![Analytics](#) |

---

## Project Structure

```
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Signup + Login logic
│   │   └── taskController.js   # Task CRUD + CSV export
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protection
│   │   └── errorHandler.js     # Global error handler
│   ├── models/
│   │   ├── User.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/axios.js         # Axios instance + interceptors
    │   ├── components/          # Reusable UI components
    │   ├── context/AuthContext  # Global auth state
    │   └── pages/               # Login, Signup, Dashboard
    └── tailwind.config.js
```

---

## Running Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/task-dashboard.git
cd task-dashboard
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/task-dashboard
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run dev
```

### 3. Set up the frontend
```bash
cd ../frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`, backend at `http://localhost:5000`.

---

## Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add environment variables under **Environment**:
   - `MONGO_URI` — your Atlas connection string
   - `JWT_SECRET` — a long random string
   - `NODE_ENV` — `production`
   - `FRONTEND_URL` — your Vercel app URL (e.g. `https://taskflow.vercel.app`)
7. Click **Create Web Service** and copy the generated URL

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL` — your Render backend URL + `/api` (e.g. `https://taskflow-api.onrender.com/api`)
5. Click **Deploy**

### Fixing CORS on Render

In `backend/.env` (or Render environment variables), set:
```
FRONTEND_URL=https://your-app.vercel.app
```

The server's CORS config reads this value and allows requests from that origin automatically. No code changes needed.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/tasks` | Yes | Get all tasks for user |
| POST | `/api/tasks` | Yes | Create a task |
| PUT | `/api/tasks/:id` | Yes | Update a task |
| DELETE | `/api/tasks/:id` | Yes | Delete a task |
| GET | `/api/tasks/export` | Yes | Download tasks as CSV |

---

## License

MIT
