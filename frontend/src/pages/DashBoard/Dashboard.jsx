import { createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowDownToLine, ArrowRight, BarChart3, Check, CircleAlert, Clock3, FileSpreadsheet, LoaderCircle, Menu, RefreshCw, Trash2, Upload } from "lucide-react";
import API from "../../api";
import Sidebar from "../../components/Sidebar";
import { AuthContext } from "../../context/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessFailPieChart from "../../components/SuccessFailPieChart";

const StatCard = ({ icon: Icon, label, value, detail, tone }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      </div>
      <span className={`rounded-xl p-3 ${tone}`}>{createElement(Icon, { size: 20 })}</span>
    </div>
    <p className="mt-4 text-xs text-slate-500">{detail}</p>
  </article>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUploadHistory = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await API.get("/upload/history");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch upload history", err);
      toast.error("Couldn't load your uploads. Check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUploadHistory();
  }, [fetchUploadHistory]);

  const stats = useMemo(() => {
    const successful = history.filter((item) => item.status === "success").length;
    const failed = history.filter((item) => item.status === "fail").length;
    return { total: history.length, successful, failed };
  }, [history]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.filename}” from your upload history?`)) return;
    try {
      await API.delete(`/upload/${item._id}`);
      setHistory((items) => items.filter((upload) => upload._id !== item._id));
      toast.success("Upload deleted.");
    } catch (err) {
      console.error("Failed to delete upload", err);
      toast.error("Couldn't delete this upload. Please try again.");
    }
  };

  const handleDownload = (item) => {
    const blob = new Blob([JSON.stringify(item.parsedData || [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.filename.replace(/\.[^/.]+$/, "")}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Data downloaded as JSON.");
  };

  const recentUploads = history.slice(0, 5);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-slate-900">
      <ToastContainer position="top-right" autoClose={2800} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-w-0 flex-1 px-4 pb-8 pt-4 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <header className="mb-7 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden">
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Your workspace</p>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Welcome back, {firstName}</h1>
            </div>
          </div>
          <button type="button" onClick={() => fetchUploadHistory({ quiet: true })} disabled={refreshing} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 sm:px-4">
            {refreshing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span className="hidden sm:inline">{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </header>

        <section className="mb-7 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 p-6 text-slate-900 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-800"><Activity size={14} /> Make your next data move</div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Turn a spreadsheet into a clear picture.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Upload a workbook to compare numbers, make charts, and get an easy-to-read summary.</p>
            </div>
            <Link to="/upload" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400">
              <Upload size={17} /> Upload an Excel file <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section aria-label="Upload statistics" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard icon={FileSpreadsheet} label="Total uploads" value={loading ? "—" : stats.total} detail="Workbooks in your history" tone="bg-blue-50 text-blue-700" />
          <StatCard icon={Check} label="Successfully analyzed" value={loading ? "—" : stats.successful} detail="Ready to explore and chart" tone="bg-emerald-50 text-emerald-700" />
          <StatCard icon={CircleAlert} label="Needs attention" value={loading ? "—" : stats.failed} detail="Uploads that need another try" tone="bg-amber-50 text-amber-700" />
        </section>

        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
              <div><h2 className="font-semibold text-slate-950">Recent uploads</h2><p className="mt-1 text-xs text-slate-500">Your latest spreadsheet activity</p></div>
              <Link to="/dashboard/history" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">View history <ArrowRight size={15} /></Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-5 sm:p-6" aria-label="Loading uploads">
                {[0, 1, 2].map((item) => <div key={item} className="h-[68px] animate-pulse rounded-xl bg-slate-100" />)}
              </div>
            ) : recentUploads.length === 0 ? (
              <div className="px-6 py-12 text-center sm:py-16">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700"><FileSpreadsheet size={25} /></span>
                <h3 className="mt-4 font-semibold text-slate-900">Your workspace is ready</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Upload your first Excel workbook and it will show up here with its analysis status.</p>
                <Link to="/upload" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"><Upload size={16} /> Upload your first file</Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentUploads.map((item) => (
                  <li key={item._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FileSpreadsheet size={19} /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{item.filename}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500"><span>{item.parsedData?.length || 0} rows</span><span aria-hidden="true">·</span><span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 pl-[52px] sm:justify-end sm:pl-0">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${item.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.status === "success" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {item.status === "success" ? "Ready" : "Failed"}
                      </span>
                      <div className="flex items-center gap-1">
                        {item.status === "success" && <button type="button" onClick={() => handleDownload(item)} aria-label={`Download ${item.filename} data`} title="Download data" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><ArrowDownToLine size={17} /></button>}
                        <button type="button" onClick={() => handleDelete(item)} aria-label={`Delete ${item.filename}`} title="Delete upload" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 5 && <div className="border-t border-slate-100 px-5 py-3 text-center sm:px-6"><Link to="/dashboard/history" className="text-xs font-medium text-slate-500 hover:text-emerald-700">Showing 5 of {history.length} uploads · View all</Link></div>}
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-semibold text-slate-950">Upload health</h2><p className="mt-1 text-xs text-slate-500">Successful vs. failed uploads</p></div>
              <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><BarChart3 size={19} /></span>
            </div>
            {loading ? (
              <div className="mt-5 grid h-[200px] place-items-center"><LoaderCircle size={20} className="animate-spin text-emerald-600" /></div>
            ) : stats.total === 0 ? (
              <div className="mt-5 flex h-[200px] flex-col items-center justify-center rounded-xl bg-slate-50 px-4 text-center">
                <Clock3 size={22} className="text-slate-400" />
                <p className="mt-3 text-sm font-medium text-slate-700">No upload activity yet</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Your status summary will appear after your first upload.</p>
              </div>
            ) : (
              <div className="mt-3"><SuccessFailPieChart success={stats.successful} fail={stats.failed} /></div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div><p className="text-xs text-slate-500">Success rate</p><p className="mt-1 text-lg font-semibold text-emerald-700">{stats.total ? `${Math.round((stats.successful / stats.total) * 100)}%` : "—"}</p></div>
              <div><p className="text-xs text-slate-500">Latest activity</p><p className="mt-1 text-sm font-semibold text-slate-800">{history[0] ? new Date(history[0].createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</p></div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
