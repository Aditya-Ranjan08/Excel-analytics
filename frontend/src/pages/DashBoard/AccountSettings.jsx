import { useCallback, useContext, useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertTriangle, Check, CircleHelp, LoaderCircle, Menu, RefreshCw, Settings2, ShieldCheck, UserRound } from "lucide-react";

const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const AccountSettings = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [savedProfile, setSavedProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await API.get("/user/me");
      const profile = { name: res.data?.name || "", email: res.data?.email || "" };
      setSavedProfile(profile);
      setForm((current) => ({ ...current, ...profile }));
    } catch (err) {
      console.error("Failed to load profile", err);
      setLoadError(err.response?.data?.message || "Couldn't load your account details. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const onChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const onSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const body = { name: form.name.trim(), email: form.email.trim() };
      if (form.password) body.password = form.password;
      const res = await API.put("/user", body);
      if (res.data?.token) login(res.data.token);
      const updatedProfile = { name: res.data?.user?.name || body.name, email: res.data?.user?.email || body.email };
      setSavedProfile(updatedProfile);
      toast.success("Your account details were saved.");
      setForm({ ...updatedProfile, password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your account details.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = form.name.trim() !== savedProfile.name || form.email.trim() !== savedProfile.email || Boolean(form.password);
  const initials = form.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

  const onDelete = async () => {
    const confirmed = window.confirm("Permanently delete your account and saved uploads? This cannot be undone.");
    if (!confirmed) return;
    try {
      setDeleting(true);
      await API.delete("/user");
      toast.success("Your account was deleted.");
      window.setTimeout(logout, 500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't delete your account.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-4 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <ToastContainer position="top-right" autoClose={2800} />
        <header className="mb-7 flex items-center gap-3">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"><Menu size={20} /></button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700"><Settings2 size={21} /></span>
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">Personal workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Account settings</h1></div>
        </header>

        <section className="mx-auto mb-5 flex max-w-6xl flex-col gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-3"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">{initials}</span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Signed-in account</p><p className="mt-1 truncate font-semibold text-slate-950">{user?.name || form.name || "Your account"}</p><p className="truncate text-sm text-slate-600">{user?.email || form.email || ""}</p></div></div>
          <p className="text-sm leading-6 text-slate-600 sm:max-w-xs">Update your profile or password here. Your uploaded workbooks stay linked to this account.</p>
        </section>

        <div className="mx-auto grid max-w-6xl items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><UserRound size={19} /></span><div><h2 className="font-semibold text-slate-950">Profile information</h2><p className="mt-1 text-xs text-slate-500">Manage the details used for your account.</p></div></div></div>
            {loading ? (
              <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin text-emerald-600" /> Loading profile…</div>
            ) : loadError ? (
              <div className="m-5 flex flex-col items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 sm:m-7"><p className="text-sm leading-6 text-amber-900">{loadError}</p><button type="button" onClick={loadProfile} className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-amber-900 shadow-sm"><RefreshCw size={15} /> Try again</button></div>
            ) : (
              <form onSubmit={onSave} className="space-y-5 px-5 py-6 sm:px-7">
                <div><label htmlFor="profile-name" className="text-sm font-medium text-slate-700">Full name</label><input id="profile-name" name="name" autoComplete="name" value={form.name} onChange={onChange} className={inputClass} required /></div>
                <div><label htmlFor="profile-email" className="text-sm font-medium text-slate-700">Email address</label><input id="profile-email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} className={inputClass} required /></div>
                <div><label htmlFor="profile-password" className="text-sm font-medium text-slate-700">New password <span className="font-normal text-slate-400">(optional)</span></label><input id="profile-password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} className={inputClass} placeholder="Leave blank to keep your current password" /><p className="mt-1.5 text-xs text-slate-500">Only enter a password if you want to change it.</p></div>
                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-400">Your password is stored securely.</p><button type="submit" disabled={saving || !hasChanges} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}{saving ? "Saving changes…" : "Save changes"}</button></div>
              </form>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheck size={19} /></span><h2 className="font-semibold text-slate-950">Account security</h2></div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600"><li className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-emerald-600" />Use a unique password that you do not reuse elsewhere.</li><li className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-emerald-600" />Use the password reset link if you lose access.</li><li className="flex gap-2.5"><Check size={16} className="mt-1 shrink-0 text-emerald-600" />Sign out on shared devices when you finish.</li></ul>
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500"><CircleHelp size={15} className="mt-0.5 shrink-0" />Two-factor authentication is not available in this project yet.</div>
            </section>

            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
              <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600"><AlertTriangle size={19} /></span><h2 className="font-semibold text-slate-950">Delete account</h2></div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Deleting your account removes your access and saved upload history. This action cannot be undone.</p>
              <button type="button" onClick={onDelete} disabled={deleting} className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60">{deleting && <LoaderCircle size={16} className="animate-spin" />}{deleting ? "Deleting account…" : "Delete my account"}</button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
