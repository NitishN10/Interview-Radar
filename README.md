# Interview Radar

**Interview Radar** is a premium, company-wise LeetCode preparation tracker and code playground. It helps developers focus their DSA prep by targeting questions asked by specific tech companies (Google, LinkedIn, Amazon, Uber, etc.) while building consistency through a rolling 1-year LeetCode-style activity map.

---

##  Features

- ** Company-Wise Coding Dataset**: Sort and filter hundreds of interview questions by difficulty, search terms, and specific target companies.
- ** LeetCode-Style Activity Timeline**: Grouped month-by-month contribution calendar with exact day grids, column alignment, and native tooltips showing daily completed problem counts.
- ** Live Streaks & Progress Dashboard**: Real-time progress trackers showing problem acceptance, solved statistics, and active daily streaks.
- ** Interactive Code Sandbox**: Write code solutions in **JavaScript**, **Python**, or **C++** using language templates and run them against mock test cases directly on the page.
- ** Adaptive Themes**: Premium dark mode and a high-contrast light mode designed for long coding sessions.

---

##  Tech Stack

- **Frontend**: React (Vite), vanilla CSS, HTML5.
- **Backend**: Node.js, Express.
- **Database**: Local JSON-based persistent storage (`db.json`).

---

##  Getting Started

To run the project on your local machine:

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2. Run the Backend Server
```bash
cd backend
npm install
npm start
```
The server will start on `http://localhost:5000`.

### 3. Run the Frontend App
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.

---

##  Deploying to the Public

### Expose on local Wi-Fi (Quick Share)
If you want to access the app from your phone or let someone in the same room try it:
```bash
npm run dev -- --host
```
Open the browser at `http://<YOUR_COMPUTER_IP>:5173`.

### Host Online (Vercel & Render)
1. **Backend (API)**: Deploy the `backend` folder as a **Web Service** on **Render.com**.
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
2. **Frontend**: Deploy the `frontend` folder to **Vercel** or **Netlify**.
   - Set the environment variable `VITE_API_URL` to point to your live Render backend URL.
