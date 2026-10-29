import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { BarChart3, ArrowRight } from "lucide-react";

const Navbar = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Hide navbar on certain routes (optional)
  const isHidden = user && (
    location.pathname.startsWith("/dashboard") ||
    ["/admin", "/upload", "/account-settings"].includes(location.pathname)
  );

  if (loading || isHidden) return null;

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link to="/" className="flex min-w-0 items-center gap-2.5 text-slate-950" aria-label="Excel Analytics home">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-700/20"><BarChart3 size={20} /></span>
          <span className="truncate text-base font-bold tracking-tight sm:text-lg">Excel Analytics</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-4">
              Dashboard <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:px-4">Log in</Link>
              <Link to="/signup" className="rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:px-4">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
