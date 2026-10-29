import { useState } from "react";
import { Menu, UploadCloud } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import UploadForm from "../../components/UploadForm";

const UploadPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="min-w-0 flex-1 px-4 pb-10 pt-4 sm:px-6 lg:ml-64 lg:px-10 lg:py-9">
        <header className="mb-7 flex items-center gap-3">
          <button type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm lg:hidden"><Menu size={20} /></button>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><UploadCloud size={21} /></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Data workspace</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Upload files</h1></div>
        </header>
        <UploadForm />
      </main>
    </div>
  );
};

export default UploadPage;
