import { createElement, lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, BarChart3, ChevronDown, CircleDot, Download, LoaderCircle, Menu, PencilLine, ScatterChart, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";
import { Bar, Line, Doughnut, Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import API from "../../api";
import Sidebar from "../../components/Sidebar";

const ThreeDChartWrapper = lazy(() => import("./ThreeDChartWrapper"));

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const chartTypes = [
  { value: "bar", label: "Bar", description: "Compare groups", icon: BarChart3 },
  { value: "line", label: "Line", description: "Follow a trend", icon: TrendingUp },
  { value: "donut", label: "Donut", description: "Show parts of a whole", icon: CircleDot },
  { value: "scatter", label: "Scatter", description: "Compare two numbers", icon: ScatterChart },
  { value: "digital", label: "Step line", description: "Show step changes", icon: Activity },
  { value: "3d", label: "3D bar", description: "Explore in 3D", icon: BarChart3 },
];

const parseNumeric = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  let normalized = value.trim().replace(/[,$₹€£¥\s]/g, "").replace(/%$/, "");
  if (!normalized) return null;
  if (/^\(.*\)$/.test(normalized)) normalized = `-${normalized.slice(1, -1)}`;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};
const isNumeric = (value) => parseNumeric(value) !== null;
const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-400";
const getSuggestedColumns = (rows, chart = "bar") => {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const numberColumns = columns.filter((column) => rows.some((row) => isNumeric(row[column])));
  const categoryColumn = columns.find((column) => !numberColumns.includes(column)) || columns[0] || "";
  const x = chart === "scatter" ? numberColumns[0] || "" : categoryColumn;
  const y = numberColumns.find((column) => column !== x) || numberColumns[0] || (chart === "scatter" ? "" : "__row_count__");
  return { x, y };
};

const Charts = () => {
  const location = useLocation();
  const requestedUploadId = location.state?.uploadId || "";
  const chartRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const [uploads, setUploads] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [data, setData] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadUploads = useCallback(async () => {
    setLoadingUploads(true);
    setLoadError("");
    try {
      const res = await API.get("/upload/history");
      const files = (res.data || []).filter((file) => file.status === "success");
      setUploads(files);
      const firstChoice = files.find((file) => file._id === requestedUploadId) || files[0];
      const rows = firstChoice?.parsedData || [];
      const suggested = getSuggestedColumns(rows);
      setSelectedFileId(firstChoice?._id || "");
      setData(rows);
      setXKey(suggested.x);
      setYKey(suggested.y);
    } catch (err) {
      console.error("Error fetching workbook list:", err);
      setLoadError("We couldn't load your workbooks. Check your connection and try again.");
    } finally {
      setLoadingUploads(false);
    }
  }, [requestedUploadId]);

  useEffect(() => { loadUploads(); }, [loadUploads]);

  const keys = data.length > 0 ? Object.keys(data[0]) : [];
  const numericKeys = keys.filter((key) => data.some((row) => isNumeric(row[key])));
  const selectedFile = uploads.find((file) => file._id === selectedFileId);
  const xOptions = chartType === "scatter" ? numericKeys : keys;

  const pairs = !xKey || !yKey ? [] : yKey === "__row_count__"
    ? Object.entries(data.reduce((counts, row) => {
        const category = String(row[xKey] ?? "Blank");
        counts[category] = (counts[category] || 0) + 1;
        return counts;
      }, {})).map(([x, y]) => ({ x, y }))
    : data.map((row) => ({ x: row[xKey], y: parseNumeric(row[yKey]) }))
      .filter((pair) => pair.x !== undefined && pair.y !== null);
  const sortedPairs = chartType === "bar" ? [...pairs].sort((a, b) => b.y - a.y) : pairs;
  const labels = sortedPairs.map((pair) => String(pair.x));
  const values = sortedPairs.map((pair) => pair.y);
  const scatterPoints = pairs.filter((pair) => isNumeric(pair.x)).map((pair) => ({ x: parseNumeric(pair.x), y: pair.y }));
  const barColors = values.map((_, index) => `hsl(${220 + (index / Math.max(1, values.length)) * 80} 70% 60%)`);
  const chartData = {
    labels,
    datasets: [{
      label: xKey && yKey ? `${yKey === "__row_count__" ? "Rows" : yKey} by ${xKey}` : "",
      data: values,
      backgroundColor: chartType === "donut" ? values.map((_, index) => ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#0f766e", "#2dd4bf"][index % 6]) : chartType === "bar" ? barColors : "transparent",
      borderColor: chartType === "bar" ? barColors : "#10b981",
      borderWidth: chartType === "bar" ? 1 : 2,
      fill: false,
      stepped: chartType === "digital",
    }],
  };
  const scatterData = { datasets: [{ label: xKey && yKey ? `${yKey} vs ${xKey}` : "", data: scatterPoints, backgroundColor: "#3b82f6" }] };
  const chartTitle = yKey === "__row_count__" ? `Rows by ${xKey}` : `${yKey} by ${xKey}`;
  const commonOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { title: { display: true, text: xKey || "X axis" }, ticks: { maxRotation: 45, minRotation: 0 } },
      y: { title: { display: true, text: yKey || "Y axis" } },
    },
  };
  const canPlot = selectedFileId && xKey && yKey && (chartType === "scatter" ? scatterPoints.length > 0 : pairs.length > 0);

  const handleChartType = (type) => {
    setChartType(type);
    if (type === "scatter") {
      const numericX = numericKeys.includes(xKey) ? xKey : numericKeys[0] || "";
      const numericY = numericKeys.includes(yKey) && yKey !== numericX
        ? yKey
        : numericKeys.find((key) => key !== numericX) || "";
      setXKey(numericX);
      setYKey(numericY);
    }
  };

  const handleWorkbookChange = (uploadId) => {
    const file = uploads.find((upload) => upload._id === uploadId);
    const rows = file?.parsedData || [];
    const suggested = getSuggestedColumns(rows, chartType);
    setSelectedFileId(uploadId);
    setData(rows);
    setXKey(suggested.x);
    setYKey(suggested.y);
  };

  const handleDownload = () => {
    try {
      const imageUrl = chartType === "3d" ? threeCanvasRef.current?.toDataURL("image/png") : chartRef.current?.toBase64Image();
      if (!imageUrl) return;
      const link = document.createElement("a");
      const base = (selectedFile?.filename || "chart").replace(/\.[^/.]+$/, "");
      link.href = imageUrl;
      link.download = `${base}-${chartType}-${xKey}-vs-${yKey}.png`;
      link.click();
    } catch (err) {
      console.error("Chart export failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-4 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <header className="mb-7 flex items-center gap-3">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"><Menu size={20} /></button>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><BarChart3 size={21} /></span>
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Explore your workbooks</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Visualizations</h1></div>
        </header>

        {loadingUploads ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500"><span className="inline-flex items-center gap-2"><LoaderCircle size={18} className="animate-spin text-emerald-600" /> Loading your workbooks…</span></div>
        ) : loadError ? (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-center"><p className="text-sm text-amber-900">{loadError}</p><button type="button" onClick={loadUploads} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-amber-900">Try again</button></div>
        ) : uploads.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700"><BarChart3 size={22} /></span>
            <h2 className="mt-4 font-semibold text-slate-900">Start with an Excel workbook</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Upload a spreadsheet first. We’ll select it here so you can choose what to compare and build a chart.</p>
            <Link to="/upload" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Upload an Excel file</Link>
          </section>
        ) : (
          <div className="flex flex-col gap-5">
            <details open className="group order-1 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm shadow-emerald-900/[0.05]">
              <summary className="flex cursor-pointer list-none items-center gap-3 bg-emerald-50 px-4 py-4 outline-none transition hover:bg-emerald-100 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 sm:px-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-800/20"><SlidersHorizontal size={20} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-emerald-950 sm:text-base">Customize your chart</span><span className="mt-0.5 block text-xs text-emerald-900/70">Change the workbook, columns, or chart style</span></span>
                <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex"><PencilLine size={13} /> Edit</span>
                <ChevronDown size={19} className="shrink-0 text-emerald-800 transition-transform group-open:rotate-180" />
              </summary>
              <div className="p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start">
                <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-emerald-700"><Sparkles size={14} /> Chart settings</div><h2 className="mt-2 text-lg font-semibold text-slate-950">Change what the chart shows</h2><p className="mt-1 text-sm text-slate-500">A starting chart is already ready below. Update these options only if you want to explore another view.</p></div>
                {selectedFile && <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600"><span className="font-semibold text-slate-900">{data.length.toLocaleString()}</span> rows <span className="px-1 text-slate-300">·</span> <span className="font-semibold text-slate-900">{keys.length}</span> columns</div>}
              </div>

              <div className="grid gap-6 pt-5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.8fr)]">
                  <label className="block min-w-0">
                    <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-800">1</span>Choose a spreadsheet</span>
                    <select aria-label="Choose a spreadsheet" onChange={(event) => handleWorkbookChange(event.target.value)} value={selectedFileId} className={selectClass}>{uploads.map((upload) => <option key={upload._id} value={upload._id}>{upload.filename}</option>)}</select>
                    <span className="mt-1.5 block text-xs text-slate-400">Your most recent successful upload is selected automatically.</span>
                  </label>
                  <div className="flex items-end"><Link to="/upload" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:w-auto"><BarChart3 size={16} /> Use another file</Link></div>
                </div>

                <div>
                  <div className="mb-3"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-800">2</span>Choose what to compare</span><p className="ml-8 mt-1 text-xs text-slate-500">X is the group or category. Y is the number you want to measure.</p></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">X axis · {chartType === "scatter" ? "number" : "category"}</span><select aria-label={chartType === "scatter" ? "X axis numeric value" : "X axis category"} onChange={(event) => { const nextX = event.target.value; setXKey(nextX); if (chartType === "scatter" && nextX === yKey) setYKey(numericKeys.find((key) => key !== nextX) || nextX); }} value={xKey} className={selectClass}>{xOptions.map((key) => <option key={key} value={key}>{key}</option>)}</select><span className="mt-1.5 block text-xs text-slate-400">{chartType === "scatter" ? "Choose a numeric column, like age or price" : "Examples: month, region, product name"}</span></label>
                    <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">Y axis · number to measure</span><select aria-label="Y axis numeric value" onChange={(event) => { const nextY = event.target.value; setYKey(nextY); if (chartType === "scatter" && nextY === xKey) setXKey(numericKeys.find((key) => key !== nextY) || nextY); }} value={yKey} className={selectClass}><option value="">Choose a measure</option>{chartType !== "scatter" && <option value="__row_count__">Number of rows (count)</option>}{numericKeys.map((key) => <option key={key} value={key}>{key}</option>)}</select><span className="mt-1.5 block text-xs text-slate-400">Examples: sales, quantity, score{chartType !== "scatter" ? ", or count rows" : ""}</span></label>
                  </div>
                  {numericKeys.length === 0 && <p className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">This sheet has no numeric columns, so the chart counts rows for each category. Scatter charts need at least two numeric columns.</p>}
                </div>

                <div>
                  <div className="mb-3"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-800">3</span>Choose how to show it</span><p className="ml-8 mt-1 text-xs text-slate-500">Not sure? Bar is a good place to start.</p></div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
                    {chartTypes.map((type) => {
                      const selected = chartType === type.value;
                      const scatterUnavailable = type.value === "scatter" && numericKeys.length < 2;
                      return <button key={type.value} type="button" aria-pressed={selected} disabled={scatterUnavailable} onClick={() => handleChartType(type.value)} className={`rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${selected ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}><span className={`inline-flex rounded-lg p-2 ${selected ? "bg-white text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{createElement(type.icon, { size: 17 })}</span><span className="mt-2 block text-xs font-semibold text-slate-900">{type.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{scatterUnavailable ? "Needs two number columns" : type.description}</span></button>;
                    })}
                  </div>
                </div>
              </div>
              </div>
            </details>

            <section className="order-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-6">
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-xs leading-5 text-emerald-900"><Sparkles size={16} className="shrink-0 text-emerald-700" /> Your starting chart is ready. Choose different X and Y columns above anytime to update it.</div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><h2 className="font-semibold text-slate-950">{canPlot ? chartTitle : "Your chart"}</h2><p className="mt-1 text-xs text-slate-500">{selectedFile?.filename || "Chart preview"}{canPlot ? ` · ${values.length.toLocaleString()} plotted groups` : ""}</p></div><button type="button" onClick={handleDownload} disabled={!canPlot} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"><Download size={16} /> Download chart</button></div>
              {canPlot ? (
                chartType === "3d" ? (
                  <Suspense fallback={<div className="grid h-[400px] place-items-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><LoaderCircle size={17} className="animate-spin" /> Loading 3D chart…</span></div>}>
                    <ThreeDChartWrapper data={yKey === "__row_count__" ? pairs.map(({ x, y }) => ({ [xKey]: x, [yKey]: y })) : data} xKey={xKey} yKey={yKey} onCanvasReady={(canvas) => { threeCanvasRef.current = canvas; }} />
                  </Suspense>
                ) : chartType === "donut" ? (
                  <div className="mx-auto h-[360px] max-w-xl"><Doughnut ref={chartRef} data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }} /></div>
                ) : chartType === "bar" ? (
                  <div className="h-[360px] sm:h-[430px]"><Bar ref={chartRef} data={chartData} options={commonOptions} /></div>
                ) : chartType === "scatter" ? (
                  <div className="h-[360px] sm:h-[430px]"><Scatter ref={chartRef} data={scatterData} options={{ ...commonOptions, parsing: false }} /></div>
                ) : (
                  <div className="h-[360px] sm:h-[430px]"><Line ref={chartRef} data={chartData} options={commonOptions} /></div>
                )
              ) : (
                <div className="grid min-h-64 place-items-center px-4 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-50 text-slate-400"><BarChart3 size={22} /></span><p className="mt-3 text-sm font-medium text-slate-700">Your chart will appear here</p><p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Open “Customize this chart” and choose a category and a measure. If your sheet has no numbers, select “Number of rows (count)”.</p></div></div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Charts;
