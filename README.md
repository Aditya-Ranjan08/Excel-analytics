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

## Environment variables

Backend configuration names and placeholders are listed in `backend/.env.example`. Never commit `.env` files or real credentials.
