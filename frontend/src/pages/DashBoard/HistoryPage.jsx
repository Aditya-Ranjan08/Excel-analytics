import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowDownToLine, BarChart3, CheckCircle2, Clock3, Eye, FileSpreadsheet, LoaderCircle, Menu, RefreshCw, Search, Trash2, Upload, X, XCircle } from "lucide-react";
import Modal from "react-modal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../api";
import Sidebar from "../../components/Sidebar";

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const HistoryPage = () => {
  const [uploads, setUploads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const fetchHistory = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setLoadError("");
    try {
      const res = await API.get("/upload/history");
      setUploads(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching history:", error);
      setLoadError("Couldn't load your upload history. Check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);
  useEffect(() => { Modal.setAppElement("#root"); }, []);

  const counts = useMemo(() => ({
    total: uploads.length,
    ready: uploads.filter((item) => item.status === "success").length,
    failed: uploads.filter((item) => item.status !== "success").length,
  }), [uploads]);

  const filteredUploads = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return uploads.filter((item) => {
      const matchesName = (item.filename || "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || (statusFilter === "success" ? item.status === "success" : item.status !== "success");
      return matchesName && matchesStatus;
    });
  }, [uploads, searchTerm, statusFilter]);

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete “${item.filename}” from your upload history?`)) return;
    try {
      await API.delete(`/upload/${item._id}`);
      setUploads((current) => current.filter((upload) => upload._id !== item._id));
      toast.success("Upload removed from your history.");
      if (preview?._id === item._id) setPreview(null);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(error.response?.data?.message || "Couldn't delete this upload. Try again.");
    }
  };

  const handleDownload = (item) => {
    const blob = new Blob([JSON.stringify(item.parsedData || [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(item.filename || "workbook").replace(/\.[^/.]+$/, "")}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-slate-900">
      <ToastContainer position="top-right" autoClose={2800} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-4 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <header className="mb-7 flex flex-wrap items-center gap-3">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"><Menu size={20} /></button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700"><Clock3 size={21} /></span>
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">Your past work</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">File history</h1></div>
          <button type="button" onClick={() => fetchHistory({ quiet: true })} disabled={refreshing || loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /><span className="hidden sm:inline">Refresh</span></button>
          <Link to="/upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:px-4"><Upload size={16} /><span className="hidden sm:inline">Upload file</span><span className="sm:hidden">Upload</span></Link>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          {[["Total uploads", counts.total, FileSpreadsheet, "bg-blue-50 text-blue-700"], ["Ready to explore", counts.ready, CheckCircle2, "bg-emerald-50 text-emerald-700"], ["Needs attention", counts.failed, AlertCircle, "bg-amber-50 text-amber-700"]].map(([label, value, Icon, tone]) => (
            <article key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{loading ? "—" : value}</p></div><span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>{createElement(Icon, { size: 20 })}</span></article>
          ))}
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-5 sm:px-6 md:flex-row md:items-end md:justify-between">
            <div><h2 className="font-semibold text-slate-950">Your workbooks</h2><p className="mt-1 text-sm text-slate-500">Preview data, open charts, download the parsed data, or remove an upload.</p></div>
            <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_160px] md:w-[440px] md:shrink-0">
              <label className="relative block"><span className="sr-only">Search by file name</span><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search file names" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10" /></label>
              <label><span className="sr-only">Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"><option value="all">All statuses</option><option value="success">Ready</option><option value="fail">Failed</option></select></label>
            </div>
          </div>

          {loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><LoaderCircle size={18} className="animate-spin text-emerald-600" /> Loading your uploads…</span></div>
            : loadError ? <div className="m-4 flex flex-col items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center sm:m-6"><AlertCircle size={22} className="text-amber-700" /><p className="text-sm text-amber-900">{loadError}</p><button type="button" onClick={() => fetchHistory()} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm">Try again</button></div>
              : filteredUploads.length === 0 ? <div className="px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-slate-400"><Search size={21} /></span><h3 className="mt-4 font-semibold text-slate-900">{uploads.length ? "No matching workbooks" : "No uploads yet"}</h3><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{uploads.length ? "Try another file name or status filter." : "Upload an Excel file to see its status and revisit its data here."}</p>{!uploads.length && <Link to="/upload" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"><Upload size={16} /> Upload your first file</Link>}</div>
                : <div className="divide-y divide-slate-100">
                  {filteredUploads.map((item) => {
                    const ready = item.status === "success";
                    const columns = item.parsedData?.length ? Object.keys(item.parsedData[0]).length : 0;
                    return <article key={item._id} className="flex flex-col gap-4 px-4 py-4 transition hover:bg-slate-50/60 sm:px-6 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-start gap-3"><span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${ready ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}><FileSpreadsheet size={19} /></span><div className="min-w-0"><p className="break-all text-sm font-semibold text-slate-900">{item.filename || "Untitled workbook"}</p><div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"><span>{(item.parsedData?.length || 0).toLocaleString()} rows</span><span aria-hidden="true">·</span><span>{columns} columns</span><span aria-hidden="true">·</span><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></div></div></div>
                      <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ready ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{ready ? <CheckCircle2 size={14} /> : <XCircle size={14} />}{ready ? "Ready" : "Failed"}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setPreview(item)} disabled={!ready || !item.parsedData?.length} title="Preview workbook data" aria-label={`Preview ${item.filename}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><Eye size={16} /><span className="hidden lg:inline">Preview</span></button>
                          {ready && <Link to="/dashboard/charts" state={{ uploadId: item._id }} title="Open workbook visualization" aria-label={`Visualize ${item.filename}`} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"><BarChart3 size={16} /><span className="hidden lg:inline">Charts</span></Link>}
                          {ready && <button type="button" onClick={() => handleDownload(item)} title="Download parsed data as JSON" aria-label={`Download ${item.filename} data`} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><ArrowDownToLine size={16} /></button>}
                          <button type="button" onClick={() => handleDelete(item)} title="Delete upload" aria-label={`Delete ${item.filename}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </article>;
                  })}
                </div>}
          {!loading && !loadError && uploads.length > 0 && <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 sm:px-6">Showing {filteredUploads.length} of {uploads.length} uploads <span className="px-1">·</span> Files are listed newest first</div>}
        </section>

        <Modal isOpen={Boolean(preview)} onRequestClose={() => setPreview(null)} contentLabel="Workbook data preview" className="relative mx-auto mt-[5vh] max-h-[90vh] w-[min(1100px,94vw)] overflow-hidden rounded-2xl bg-white shadow-2xl outline-none" overlayClassName="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6">
          {preview && <div className="flex max-h-[90vh] flex-col"><div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6"><div className="min-w-0"><h2 className="break-all font-semibold text-slate-950">{preview.filename}</h2><p className="mt-1 text-xs text-slate-500">Previewing up to 50 rows from the first worksheet</p></div><button type="button" onClick={() => setPreview(null)} aria-label="Close preview" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
            <div className="overflow-auto p-3 sm:p-5">{preview.parsedData?.length ? <table className="min-w-full border-collapse text-left text-xs sm:text-sm"><thead className="sticky top-0 bg-slate-50 text-slate-600"><tr>{Object.keys(preview.parsedData[0]).map((column) => <th key={column} className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 font-semibold">{column}</th>)}</tr></thead><tbody>{preview.parsedData.slice(0, 50).map((row, index) => <tr key={index} className="even:bg-slate-50/60">{Object.keys(preview.parsedData[0]).map((column) => <td key={column} className="max-w-64 whitespace-nowrap border-b border-slate-100 px-3 py-2 text-slate-700">{String(row[column] ?? "—")}</td>)}</tr>)}</tbody></table> : <p className="p-8 text-center text-sm text-slate-500">No preview data available.</p>}</div>
            <div className="border-t border-slate-100 px-4 py-3 text-right text-xs text-slate-500 sm:px-6">{Math.min(preview.parsedData?.length || 0, 50)} of {(preview.parsedData?.length || 0).toLocaleString()} rows</div></div>}
        </Modal>
      </main>
    </div>
  );
};

export default HistoryPage;
