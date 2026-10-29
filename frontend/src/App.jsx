import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import {  AuthContext } from "./context/AuthContext";
import Home from "./pages/auth/Home";
import Nav from "./components/Navbar";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
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
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}


export default App;
