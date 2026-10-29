import { useState } from "react";
import API from "../../api";
import AuthLayout from "../../components/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const Signup = () => {
  const [data, setData] = useState({ name: "", email: "", password: "", role: "user" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await API.post("/auth/signup", data);
      toast.success("Your account is ready. You can log in now.");
      window.setTimeout(() => navigate("/login"), 1100);
    } catch (err) {
      console.error("Signup failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.msg || err.response?.data?.message || "We couldn't create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} />
      <AuthLayout
        eyebrow="Get started"
        title="Create your account"
        description="Set up your workspace and start exploring your spreadsheets."
        footer={<>Already have an account? <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Log in</Link></>}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-name" className="text-sm font-medium text-slate-700">Full name</label>
            <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Your name" value={data.name} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="signup-email" className="text-sm font-medium text-slate-700">Email address</label>
            <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={data.email} onChange={handleChange} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="signup-password" className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input id="signup-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Create a password" value={data.password} onChange={handleChange} className={`${inputClass} pr-12`} required />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting && <LoaderCircle size={17} className="animate-spin" />}
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
      </AuthLayout>
    </>
  );
};

export default Signup;
