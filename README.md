# Excel Analytics

A MERN application for uploading Excel workbooks, previewing their data, building charts, and generating plain-language summaries.

## Run locally

1. Install dependencies in both folders:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Create `backend/.env` using `backend/.env.example` as a template. Set your MongoDB URI, JWT secret, and email settings for password reset.
3. Start the backend in one terminal:

   ```bash
   cd backend && npm run dev
   ```

4. Start the frontend in another terminal:

   ```bash
   cd frontend && npm run dev
   ```

The Vite development server prints the local URL. Set `VITE_API_BASE_URL` in `frontend/.env` when the API is hosted somewhere other than `http://localhost:5000/api`.

## Deploy to Render

The root `render.yaml` configures the backend web service and frontend static site. In Render, create a **Blueprint** from this repository and provide your MongoDB connection string when prompted. Render generates the JWT secret and connects the frontend API URL and password-reset frontend URL automatically.

The frontend build requires Node.js 22.12 or newer. For optional features, add `OPENAI_API_KEY`, `SENDGRID_API_KEY`, and `FROM_EMAIL` to the backend service's Render environment. If configuring services manually instead of using the Blueprint, use `backend` and `frontend` as their respective root directories, set the frontend build-time variable `VITE_API_BASE_URL` to the backend URL ending in `/api`, and configure the frontend static-site rewrite `/*` to `/index.html`.

## Environment variables

Backend configuration names and placeholders are listed in `backend/.env.example`. Never commit `.env` files or real credentials.
