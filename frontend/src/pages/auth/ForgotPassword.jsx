import { useState } from "react";
import API from "../../api";
import AuthLayout from "../../components/AuthLayout";
import { Link } from "react-router-dom";
import { Check, LoaderCircle, Mail } from "lucide-react";

const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await API.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't send a reset email. Please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title={sent ? "Check your inbox" : "Reset your password"}
      description={sent ? "If an account exists for that email, a reset link will arrive shortly." : "Enter the email address linked to your account. We'll send a secure reset link if it matches."}
      footer={<>Remember your password? <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Back to log in</Link></>}
    >
      {sent ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6" role="status">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-emerald-700 shadow-sm"><Check size={21} /></span>
          <p className="mt-4 font-semibold text-slate-900">Email request submitted</p>
          <p className="mt-2 break-all text-sm text-slate-600">If <span className="font-medium text-slate-800">{email}</span> is registered, the message should arrive soon. Check your spam folder too.</p>
          <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800">Try another email</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="recovery-email" className="text-sm font-medium text-slate-700">Email address</label>
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input id="recovery-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-11`} required />
            </div>
          </div>
          {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <Mail size={17} />}
            {submitting ? "Sending request…" : "Send reset link"}
          </button>
          <p className="text-center text-xs leading-5 text-slate-400">Reset links expire after 15 minutes and can only be used once.</p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
