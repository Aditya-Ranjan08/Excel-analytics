import { createElement, useContext, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { AlertTriangle, BarChart3, Clock3, FileSpreadsheet, House, LogOut, Settings2, Sparkles, Upload, X } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: House, end: true },
  { to: "/upload", label: "Upload files", icon: Upload, end: true },
  { to: "/dashboard/charts", label: "Visualizations", icon: BarChart3 },
  { to: "/dashboard/history", label: "File history", icon: Clock3 },
  { to: "/dashboard/insight", label: "Smart Analysis", icon: Sparkles },
  { to: "/account-settings", label: "Account settings", icon: Settings2, end: true },
];

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user, logout } = useContext(AuthContext);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const cancelButtonRef = useRef(null);
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

  useEffect(() => {
    if (!confirmSignOut) return undefined;
    cancelButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setConfirmSignOut(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmSignOut]);

  const handleSignOut = () => {
    setConfirmSignOut(false);
    onClose();
    logout();
  };

  return (
    <>
      <button type="button" aria-label="Close navigation menu" onClick={onClose} className={`${isOpen ? "fixed" : "hidden"} inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] lg:hidden`} />
      <aside aria-label="Main navigation" className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 text-slate-900 shadow-xl shadow-slate-900/10 transition-transform duration-300 lg:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="mb-8 flex items-center gap-3 px-2">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-700/20"><BarChart3 size={22} strokeWidth={2.2} /></span>
          <div className="min-w-0 flex-1"><p className="truncate text-[15px] font-bold tracking-tight text-slate-950">Excel Analytics</p><p className="mt-0.5 truncate text-xs text-slate-500">Your data workspace</p></div>
          <button type="button" aria-label="Close navigation menu" onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden"><X size={18} /></button>
        </div>

        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</div>
        <nav className="flex-1 space-y-1" aria-label="Workspace pages">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onClose} className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15 ${isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
              {({ isActive }) => <>
                {isActive && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-emerald-600" />}
                <span className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${isActive ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400 group-hover:text-slate-700"}`}>{createElement(icon, { size: 17, strokeWidth: 1.9 })}</span>
                <span className="flex-1">{label}</span>
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />}
              </>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm shadow-slate-900/[0.03]">
          <div className="flex min-w-0 items-center gap-2.5 px-0.5 py-1">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-bold text-white ring-2 ring-emerald-50">{initials}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{user?.name || "Your account"}</p><p className="truncate text-xs text-slate-500">{user?.email || "Workspace member"}</p></div>
          </div>
          <div className="my-2 border-t border-slate-100" />
          <button type="button" onClick={() => setConfirmSignOut(true)} className="group flex w-full items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-2 py-2 text-[13px] font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-red-600 transition group-hover:bg-red-100"><LogOut size={15} strokeWidth={1.9} /></span>
            <span className="flex-1 text-left">Sign out</span>
          </button>
        </div>
        <p className="flex items-center gap-1.5 px-2 pt-4 text-[10px] font-medium text-slate-400"><FileSpreadsheet size={12} />Excel Analytics workspace</p>
      </aside>

      {confirmSignOut && <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="presentation">
        <button type="button" aria-label="Cancel sign out" onClick={() => setConfirmSignOut(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
        <section role="dialog" aria-modal="true" aria-labelledby="signout-title" aria-describedby="signout-description" className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><AlertTriangle size={20} /></span>
          <h2 id="signout-title" className="mt-4 text-lg font-semibold text-slate-950">Sign out of your account?</h2>
          <p id="signout-description" className="mt-2 text-sm leading-6 text-slate-600">You’ll leave your workspace and need to log in again to continue.</p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button ref={cancelButtonRef} type="button" onClick={() => setConfirmSignOut(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-500/10">Stay logged in</button>
            <button type="button" onClick={handleSignOut} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20"><LogOut size={16} /> Sign out</button>
          </div>
        </section>
      </div>}
    </>
  );
};

export default Sidebar;
