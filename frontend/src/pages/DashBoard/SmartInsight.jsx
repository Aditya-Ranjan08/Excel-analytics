import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BarChart3, BrainCircuit, CheckCircle2, FileSpreadsheet, LoaderCircle, Menu, Sparkles } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import API from "../../api";

const SmartInsight = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [insights, setInsights] = useState([]);
  const [analysisMeta, setAnalysisMeta] = useState(null);
  const [source, setSource] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUploads = useCallback(async () => {
    setLoadingUploads(true);
    try {
      const res = await API.get("/upload/history");
      const successfulUploads = (Array.isArray(res.data) ? res.data : []).filter((upload) => upload.status === "success");
      setUploads(successfulUploads);
      setSelectedId((current) => current || successfulUploads[0]?._id || "");
    } catch (err) {
      console.error("Failed to load uploads for Smart Analysis", err);
      setError("We couldn't load your uploads. Please refresh and try again.");
    } finally {
      setLoadingUploads(false);
    }
  }, []);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const getInsight = async () => {
    if (!selectedId || loading) return;
    setError("");
    setLoading(true);
    setSummary("");
    setInsights([]);
    setAnalysisMeta(null);
    try {
      const res = await API.get(`/insights/${selectedId}`);
      setSummary(res.data?.summary || "No summary available for this file.");
      setInsights(Array.isArray(res.data?.insights) ? res.data.insights : []);
      setAnalysisMeta({ rowCount: res.data?.rowCount, columnCount: res.data?.columnCount });
      setSource(res.data?.summarySource || "built-in");
      setModel(res.data?.model || "");
    } catch (err) {
      console.error("Failed to generate Smart Analysis", err);
      setError(err.response?.data?.message || "We couldn't analyze this file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedUpload = uploads.find((upload) => upload._id === selectedId);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-4 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <header className="mb-7 flex items-center gap-3">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"><Menu size={20} /></button>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><BrainCircuit size={21} /></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-700">Explore your data</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Smart Analysis</h1></div>
        </header>

        <section className="mx-auto max-w-5xl space-y-5">
          <div className="overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-violet-700"><Sparkles size={14} /> Your spreadsheet, explained</span>
            <h2 className="mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">See what your spreadsheet is telling you.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Choose a workbook to see how many records it has, which values appear most, and how its numbers compare.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-7">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600"><FileSpreadsheet size={19} /></span>
              <div><h3 className="font-semibold text-slate-900">Choose a workbook</h3><p className="mt-1 text-sm text-slate-500">Analysis is available for successfully uploaded files.</p></div>
            </div>

            {loadingUploads ? (
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500"><LoaderCircle size={17} className="animate-spin text-emerald-600" /> Loading your uploads…</div>
            ) : uploads.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-slate-800">No analyzed workbooks yet</p>
                <p className="mt-1 text-sm text-slate-500">Upload an Excel workbook first, and it will be available here.</p>
                <Link to="/upload" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Upload a file <ArrowRight size={16} /></Link>
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <select aria-label="Choose an uploaded workbook" value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setSummary(""); setInsights([]); setAnalysisMeta(null); setSource(""); setModel(""); setError(""); }} className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                  <option value="">Select a workbook</option>
                  {uploads.map((upload) => <option key={upload._id} value={upload._id}>{upload.filename}</option>)}
                </select>
                <button type="button" onClick={getInsight} disabled={!selectedId || loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                  {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Sparkles size={17} />}
                  {loading ? "Analyzing…" : "Generate analysis"}
                </button>
              </div>
            )}

            {selectedUpload && <p className="mt-3 text-xs text-slate-500">{(analysisMeta?.rowCount ?? selectedUpload.parsedData?.length ?? 0).toLocaleString()} data rows · {analysisMeta?.columnCount ?? (selectedUpload.parsedData?.[0] ? Object.keys(selectedUpload.parsedData[0]).length : 0)} columns · {selectedUpload.filename}</p>}
            {error && <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-800" role="alert"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
          </div>

          <div className="min-h-52 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div><h3 className="font-semibold text-slate-950">Analysis summary</h3><p className="mt-1 text-xs text-slate-500">Plain-language facts calculated from the rows in your workbook</p></div>
              {summary && <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700"><CheckCircle2 size={13} />{source === "openai" ? `AI${model ? ` · ${model}` : ""}` : "Data-based summary"}</span>}
            </div>
            {loading ? (
              <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin text-violet-600" /> Reviewing the workbook…</div>
            ) : summary ? (
              <div className="py-5">
                {insights.length > 0 ? (
                  <>
                    <div className="mb-4 rounded-xl border border-violet-100 bg-violet-50/70 p-4"><p className="text-sm font-semibold text-violet-950">What this sheet contains</p><p className="mt-1 text-sm leading-6 text-slate-700">{insights[0].detail}</p></div>
                    {insights.some((insight) => insight.title === "Numeric columns") && <p className="mb-3 text-xs leading-5 text-slate-500"><span className="font-semibold text-slate-700">How to read this:</span> average means the typical value per row; lowest and highest show the smallest and largest values found.</p>}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {insights.slice(1).map((insight, index) => <article key={`${insight.title}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 size={15} /></span><h4 className="text-sm font-semibold text-slate-900">{insight.title}</h4></div><p className="mt-2 text-sm leading-6 text-slate-600">{insight.detail}</p></article>)}
                    </div>
                    <div className="mt-5 flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-slate-500">These findings describe the uploaded rows. Use charts to explore values in more detail.</p>{selectedUpload && <Link to="/dashboard/charts" state={{ uploadId: selectedUpload._id }} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"><BarChart3 size={16} /> Open charts <ArrowRight size={15} /></Link>}</div>
                  </>
                ) : <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{summary}</p>}
              </div>
            ) : (
              <div className="flex min-h-32 flex-col items-center justify-center px-4 text-center">
                <Sparkles size={22} className="text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">Choose a workbook and generate an analysis to see its summary here.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SmartInsight;
