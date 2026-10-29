import { useState, useContext } from "react";
import API from "../../api";
import AuthLayout from "../../components/AuthLayout";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [data, setData] = useState({ email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await API.post("/auth/login", data);
      login(res.data.token);
      localStorage.setItem("role", res.data.user.role);
      toast.success("Welcome back!");
      navigate(res.data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || err.response?.data?.message || "We couldn't sign you in. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <AuthLayout
        eyebrow="Welcome back"
        title="Log in to your account"
        description="Pick up where you left off and get back to your data."
        footer={<>New to Excel Analytics? <Link to="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">Create an account</Link></>}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="text-sm font-medium text-slate-700">Email address</label>
            <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={data.email} onChange={handleChange} className={inputClass} required />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Forgot password?</Link>
            </div>
            <div className="relative">
              <input id="login-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={data.password} onChange={handleChange} className={`${inputClass} pr-12`} required />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting && <LoaderCircle size={17} className="animate-spin" />}
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default Login;
