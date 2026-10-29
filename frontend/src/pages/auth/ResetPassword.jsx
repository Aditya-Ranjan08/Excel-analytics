import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../api";
import AuthLayout from "../../components/AuthLayout";
import { Check, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";

const passwordInputClass = "w-full border-0 bg-transparent px-1 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0";

export default function ResetPassword() {
  const { token } = useParams();
  const [tokenState, setTokenState] = useState("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    API.get(`/auth/reset-password/${token}`)
      .then(() => { if (active) setTokenState("valid"); })
      .catch((err) => {
        if (!active) return;
        setError(err.response?.data?.message || "This reset link is invalid or has expired.");
        setTokenState("invalid");
      });
    return () => { active = false; };
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don't match. Check them and try again.");
      return;
    }

    try {
      setSubmitting(true);
      await API.put(`/auth/reset-password/${token}`, { password });
      setTokenState("complete");
    } catch (err) {
      setError(err.response?.data?.message || "We couldn't update your password. Please request a new link.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleButton = (visible, setVisible, label) => (
    <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? `Hide ${label}` : `Show ${label}`} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  let title = "Choose a new password";
  let description = "Create a new password to secure your account.";
  if (tokenState === "checking") {
    title = "Checking your link";
    description = "Please wait while we verify that this reset link is still valid.";
  } else if (tokenState === "invalid") {
    title = "Reset link unavailable";
    description = "This link may have expired or already been used.";
  } else if (tokenState === "complete") {
    title = "Password updated";
    description = "Your password is ready. Log in with your new credentials.";
  }

  return (
    <AuthLayout
      eyebrow="Secure account recovery"
      title={title}
      description={description}
      footer={<>Remembered it? <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Back to log in</Link></>}
    >
      {tokenState === "checking" ? (
        <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 p-6 text-sm text-slate-500" role="status"><LoaderCircle size={18} className="animate-spin text-emerald-600" /> Verifying secure link…</div>
      ) : tokenState === "invalid" ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800" role="alert">{error}</p>
          <Link to="/forgot-password" className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Request a new reset link</Link>
        </div>
      ) : tokenState === "complete" ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-6" role="status">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-emerald-700 shadow-sm"><Check size={21} /></span>
          <p className="mt-4 font-semibold text-slate-900">You're all set</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your password has been changed. Your reset link can no longer be used.</p>
          <Link to="/login" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Continue to log in</Link>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="text-sm font-medium text-slate-700">New password</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <LockKeyhole size={17} className="shrink-0 text-slate-400" />
              <input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={passwordInputClass} minLength={8} required />
              {toggleButton(showPassword, setShowPassword, "password")}
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="text-sm font-medium text-slate-700">Confirm new password</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10">
              <LockKeyhole size={17} className="shrink-0 text-slate-400" />
              <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder="Enter it one more time" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={passwordInputClass} minLength={8} required />
              {toggleButton(showConfirmPassword, setShowConfirmPassword, "confirmation password")}
            </div>
          </div>
          {error && <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/15 transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-70">
            {submitting && <LoaderCircle size={17} className="animate-spin" />}
            {submitting ? "Updating password…" : "Update password"}
          </button>
          <p className="text-center text-xs text-slate-400">Use at least 8 characters. This link expires after 15 minutes.</p>
        </form>
      )}
    </AuthLayout>
  );
}
