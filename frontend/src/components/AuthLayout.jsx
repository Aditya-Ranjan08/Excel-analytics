import { Link } from "react-router-dom";
import { createElement } from "react";
import { BarChart3, BrainCircuit, FileSpreadsheet, LineChart, Sparkles } from "lucide-react";

const AuthLayout = ({ eyebrow, title, description, children, footer }) => (
  <main className="relative isolate flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden bg-[#f5f7fa] px-4 py-8 sm:px-8 sm:py-12">
    <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
    <div className="grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 lg:min-h-[620px] lg:grid-cols-[0.92fr_1.08fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex xl:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white"><BarChart3 size={21} /></span>
            Excel Analytics
          </Link>
          <div className="mt-20 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-200"><Sparkles size={14} /> Spreadsheet insights, simplified</span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">Your data has a story. <span className="text-emerald-300">Find it.</span></h1>
            <p className="mt-4 leading-7 text-slate-300">Explore your Excel data with clear visuals, smart summaries, and a history you can return to.</p>
          </div>
        </div>
        <div className="relative space-y-4">
          {[
            [FileSpreadsheet, "Upload Excel workbooks"],
            [LineChart, "Build interactive charts"],
            [BrainCircuit, "Get a quick data summary"],
          ].map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-3 text-sm text-slate-200"><span className="rounded-lg bg-white/10 p-2 text-emerald-300">{createElement(Icon, { size: 17 })}</span>{label}</div>
          ))}
          <p className="pt-3 text-xs text-slate-500">A clearer way to explore the spreadsheets you already have.</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-9 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600 text-white"><BarChart3 size={17} /></span>
            Excel Analytics
          </Link>
          <p className="text-sm font-semibold text-emerald-700">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.1rem]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          <div className="mt-7">{children}</div>
          <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">{footer}</div>
          <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">By continuing, you agree to use the platform responsibly.</p>
        </div>
      </section>
    </div>
  </main>
);

export default AuthLayout;
