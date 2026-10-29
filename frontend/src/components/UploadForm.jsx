import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { ArrowRight, BarChart3, Check, FileSpreadsheet, FileUp, FolderOpen, LoaderCircle, RotateCcw, Trash2, UploadCloud } from "lucide-react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const formatSize = (bytes) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const UploadForm = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [uploadedId, setUploadedId] = useState("");

  const chooseFile = (selectedFile) => {
    if (!selectedFile) return;
    setError("");
    setUploaded(false);
    setUploadedId("");
    setParsedData([]);
    if (!/\.xlsx?$/i.test(selectedFile.name)) {
      setFile(null);
      setError("This file type isn't supported. Choose an .xlsx or .xls workbook.");
      return;
    }
    if (!selectedFile.size) {
      setFile(null);
      setError("This file is empty. Choose a workbook with data in it.");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("This file is larger than 20 MB. Choose a smaller workbook.");
      return;
    }
    setFile(selectedFile);
  };

  const handleFileSelect = (event) => {
    chooseFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setProgress(0);
    setError("");
    setUploaded(false);
    setUploadedId("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    const formData = new FormData();
    formData.append("file", file);
    setError("");
    setProgress(0);

    try {
      setUploading(true);
      const res = await API.post("/upload", formData, {
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      setParsedData(rows);
      setUploadedId(res.data?.uploadId || "");
      setProgress(100);
      setUploaded(true);
    } catch (err) {
      console.error("Error uploading workbook:", err.response?.data || err.message);
      if (err.response?.status === 409) setError("A file with this name is already in your upload history. Rename it and try again.");
      else if (err.response?.status === 401 || err.response?.status === 403) setError("Your session has expired. Log in again before uploading.");
      else setError(err.response?.data?.message || (err.response ? "Upload failed. Check the workbook and try again." : "Couldn't reach the server. Make sure the backend is running."));
    } finally {
      setUploading(false);
    }
  };

  const columns = parsedData.length ? Object.keys(parsedData[0]) : [];
  const rowsToPreview = parsedData.slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FileUp size={21} /></span>
            <div><h2 className="font-semibold text-slate-950">Upload an Excel workbook</h2><p className="mt-1 text-sm leading-6 text-slate-500">Choose a workbook and we’ll prepare its first worksheet for charts and analysis.</p></div>
          </div>
        </div>

        <div className="p-4 sm:p-7">
          {uploaded ? (
            <div>
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-emerald-700 shadow-sm"><Check size={21} /></span>
                  <div className="min-w-0"><p className="font-semibold text-emerald-950">Workbook uploaded and ready</p><p className="mt-1 truncate text-sm text-emerald-900/70">{file?.name}</p></div>
                </div>
                <button type="button" onClick={clearFile} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"><RotateCcw size={16} /> Upload another</button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[["Rows found", parsedData.length.toLocaleString()], ["Columns found", columns.length.toLocaleString()], ["File size", file ? formatSize(file.size) : "—"]].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>
                ))}
              </div>

              {parsedData.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                    <div><h3 className="text-sm font-semibold text-slate-900">Data preview</h3><p className="mt-0.5 text-xs text-slate-500">Showing {rowsToPreview.length} of {parsedData.length.toLocaleString()} rows</p></div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">First worksheet</span>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    <table className="min-w-full border-collapse text-left text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-slate-50 text-slate-600"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 font-semibold sm:px-4">{column}</th>)}</tr></thead>
                      <tbody>{rowsToPreview.map((row, index) => <tr key={index} className="even:bg-slate-50/60">{columns.map((column) => <td key={column} className="max-w-64 truncate border-b border-slate-100 px-3 py-2.5 text-slate-700 sm:px-4">{String(row[column] ?? "—")}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard/charts" state={{ uploadId: uploadedId }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"><BarChart3 size={17} /> Create a visualization <ArrowRight size={16} /></Link>
                <Link to="/dashboard/history" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"><FolderOpen size={17} /> View upload history</Link>
              </div>
            </div>
          ) : (
            <>
              <label
                htmlFor="excel-file"
                onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false); }}
                onDrop={handleDrop}
                className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-10 text-center transition sm:min-h-72 ${isDragging ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/40"}`}
              >
                <input ref={inputRef} id="excel-file" type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="sr-only" />
                <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm transition ${isDragging ? "text-emerald-700" : "text-slate-500"}`}><UploadCloud size={27} /></span>
                <p className="mt-4 font-semibold text-slate-900">{isDragging ? "Drop the workbook here" : "Drag and drop your workbook here"}</p>
                <p className="mt-1 text-sm text-slate-500">or click to browse your files</p>
                <span className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm"><FolderOpen size={16} /> Browse files</span>
                <p className="mt-4 text-xs text-slate-400">Excel workbook · .xlsx or .xls · Up to 20 MB</p>
              </label>

              {file && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><FileSpreadsheet size={19} /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{file.name}</p><p className="mt-0.5 text-xs text-slate-500">{formatSize(file.size)} · Ready to upload</p></div>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 sm:flex-none">Change file</button>
                    <button type="button" onClick={clearFile} disabled={uploading} aria-label="Remove selected workbook" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 size={17} /></button>
                  </div>
                </div>
              )}

              {error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700" role="alert">{error}</p>}

              {uploading && (
                <div className="mt-5" role="status" aria-live="polite">
                  <div className="mb-2 flex justify-between text-xs font-medium text-slate-600"><span>Uploading and analyzing workbook…</span><span>{progress}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
                </div>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-400">We analyze the first worksheet. Make sure its first row contains column names.</p>
                <button type="button" onClick={handleUpload} disabled={!file || uploading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-300">
                  {uploading ? <LoaderCircle size={17} className="animate-spin" /> : <UploadCloud size={17} />}
                  {uploading ? "Working…" : "Upload workbook"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["01", "Choose a workbook", "Select an .xlsx or .xls file up to 20 MB."],
          ["02", "Review the data", "We read the first worksheet and show a preview."],
          ["03", "Explore the results", "Build charts or revisit the file from history."],
        ].map(([number, title, description]) => <article key={number} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><span className="text-xs font-bold tracking-widest text-emerald-700">{number}</span><h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></article>)}
      </div>
    </div>
  );
};

export default UploadForm;
