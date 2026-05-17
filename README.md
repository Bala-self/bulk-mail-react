# Bulk Mailer

A full-stack web application for sending bulk emails with a clean, minimalist UI.  
Built with **React (frontend)**, **Node.js/Express (backend)**, and styled using **Tailwind CSS**.  
Supports Excel file uploads (.xls, .xlsx) for recipient lists and provides status feedback on mail sending.

---

## 🚀 Features
- Drag-and-drop Excel file upload (.xls, .xlsx only)
- Compose and send bulk emails
- Success/failure status panels for mail delivery
- Premium minimalist UI with gradient backgrounds and aligned card layouts
- Backend API integration with MongoDB Atlas

---

## 📂 Project Structure
bulkmailer/
│
├── frontend/        # React + Vite frontend
│   ├── src/         # Components, assets, styles
│   └── package.json
│
├── backend/         # Node.js + Express backend
│   ├── index.js     # Backend entry file
│   └── package.json
│
└── README.md

Code

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/username/bulkmailer.git
cd bulkmailer
2. Install dependencies
Frontend:

bash
cd frontend
npm install
Backend:

bash
cd ../backend
npm install
▶️ Running Locally
Start backend
bash
cd backend
node index.js
Start frontend
bash
cd frontend
npm run dev
Frontend runs on http://localhost:5173 (default Vite port).
Backend runs on http://localhost:5000 (or your configured port).

🌐 Deployment
GitHub
Push code to GitHub:

bash
git add .
git commit -m "Initial commit"
git push origin main
Vercel (Frontend)
Go to Vercel.

Import your GitHub repo.

Select the frontend folder as the root.

Deploy → Vercel gives you a live URL.

Backend
Vercel is best for frontend.

Deploy backend separately on Render, Railway, or Heroku.

Update frontend .env to point to backend API URL.

📌 Tech Stack
Frontend: React, Vite, Tailwind CSS

Backend: Node.js, Express, MongoDB Atlas

Deployment: GitHub + Vercel (frontend), Render/Heroku (backend)

📝 License
This project is licensed under the MIT License.

Code

---

✅ This README is ready to drop into your repo. It explains setup, local run, and deployment.  

Would you like me to also add a **Usage section with screenshots** (frontend UI + mail sending status) so your GitHub repo looks more polished?
