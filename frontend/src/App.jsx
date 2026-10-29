import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import {  AuthContext } from "./context/AuthContext";
import Home from "./pages/auth/Home";
import Nav from "./components/Navbar";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import { ArrowLeft, FileQuestion } from "lucide-react";
const Dashboard = lazy(() => import("./pages/DashBoard/Dashboard"));
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));
const UploadPage = lazy(() => import("./pages/DashBoard/UploadPage"));
const HistoryPage = lazy(() => import("./pages/DashBoard/HistoryPage"));
const Charts = lazy(() => import("./pages/DashBoard/Charts"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const SmartInsight = lazy(() => import("./pages/DashBoard/SmartInsight"));
const AccountSettings = lazy(() => import("./pages/DashBoard/AccountSettings"));

//  Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm font-medium text-slate-500">Restoring your session…</div>;
  return user ? children : <Navigate to="/login" />;
};


//  App
function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Nav />
      <Suspense fallback={<div className="grid min-h-[50vh] place-items-center text-sm font-medium text-slate-500">Loading your workspace…</div>}>
      <Routes>
      {/* auth route */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

     {/* upload Route*/}
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>}
           />

     {/* dashboard route */}
        <Route path="/dashboard/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>} 
          />

        <Route path="/dashboard/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>}
           />

        <Route path="/dashboard/charts"
              element={
                <ProtectedRoute>
                  <Charts />
                </ProtectedRoute>
               }
              />
        <Route path="/dashboard/insight"
              element={
                <ProtectedRoute>
                  <SmartInsight />
                </ProtectedRoute>
               }
              />
        <Route path="/smart-insight"
              element={
                <ProtectedRoute>
                  <SmartInsight />
                </ProtectedRoute>
               }
              />
        <Route path="/account-settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
               }
              />
     {/* usere || admin route */}
        <Route path="/admin" element={<ProtectedRoute>{user?.role === "admin" ? <AdminPanel /> : <Navigate to="/dashboard" replace />}</ProtectedRoute>} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<main className="grid min-h-[70vh] place-items-center bg-[#f5f7fa] px-4 py-12"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><FileQuestion size={25} /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-emerald-700">Page not found</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">This page isn’t here</h1><p className="mt-2 text-sm leading-6 text-slate-500">The link may be old or the address may be mistyped.</p><Link to={user ? "/dashboard" : "/"} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"><ArrowLeft size={16} /> {user ? "Back to dashboard" : "Back to home"}</Link></section></main>} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


export default App;
