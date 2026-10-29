import { Link } from "react-router-dom";
import { createElement } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Clock3,
  FileSpreadsheet,
  Search,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: FileSpreadsheet,
    title: "Start with your spreadsheet",
    description: "Upload an Excel file and turn its rows into data you can explore.",
  },
  {
    icon: BarChart3,
    title: "See the patterns",
    description: "Choose columns and build bar, line, donut, or 3D bar charts.",
  },
  {
    icon: BrainCircuit,
    title: "Get a useful summary",
    description: "Smart Analysis highlights trends with the built-in analyzer or AI.",
  },
  {
    icon: Clock3,
    title: "Pick up where you left off",
    description: "Find past uploads, preview their data, and revisit your charts.",
  },
];

const Home = () => (
  <main className="overflow-hidden bg-[#f7f9fc] text-slate-900">
    <section className="relative isolate">
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 md:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-12">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-emerald-800 shadow-sm">
            <Sparkles size={16} /> A clearer view of your spreadsheet data
          </div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Make your Excel data <span className="text-emerald-600">make sense.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Turn spreadsheets into interactive charts and readable insights. Upload a file, explore the numbers, and keep your analysis in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">
              Get started free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3.5 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              I already have an account
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Works with .xlsx and .xls files</p>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-200/60 via-cyan-100/50 to-blue-100/70 blur-xl" />
          <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl shadow-slate-900/10 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><FileSpreadsheet size={21} /></div>
                <div>
                  <p className="font-semibold text-slate-900">Quarterly overview</p>
                  <p className="text-xs text-slate-500">Your data, made easier to read</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Chart preview</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[["Revenue", "By month"], ["Categories", "Compare"], ["Trends", "Explore"]].map(([title, subtitle]) => (
                <div key={title} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4">
                  <p className="text-xs text-slate-500">{title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{subtitle}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Explore a trend</p>
                  <p className="mt-1 text-xs text-slate-500">Select columns and visualize them</p>
                </div>
                <div className="flex gap-1.5 text-slate-400"><span className="rounded-md bg-slate-100 p-2"><Search size={15} /></span><span className="rounded-md bg-slate-100 p-2"><ArrowDownToLine size={15} /></span></div>
              </div>
              <div className="mt-6 flex h-40 items-end gap-2 border-b border-l border-slate-200 px-2 sm:h-48 sm:gap-3 sm:px-4">
                {[36, 54, 45, 72, 62, 89, 76, 100, 83, 93, 70, 108].map((height, index) => (
                  <div key={index} className="flex h-full flex-1 items-end">
                    <div style={{ height: `${height}%` }} className={`w-full rounded-t-md ${index === 9 ? "bg-emerald-500" : "bg-emerald-200"}`} />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between pl-2 text-[10px] text-slate-400 sm:pl-4"><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Dec</span></div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-3.5 sm:p-4">
              <div className="mt-0.5 rounded-lg bg-white p-2 text-emerald-700 shadow-sm"><Sparkles size={16} /></div>
              <div><p className="text-sm font-semibold text-emerald-950">Smart Analysis</p><p className="mt-1 text-xs leading-5 text-emerald-900/70">Get a quick summary of patterns in your uploaded data.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-200 bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">From file to findings</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Less time wrestling with rows. More time understanding them.</h2>
          <p className="mt-4 leading-7 text-slate-600">Excel Analytics brings the steps of a basic data review together, so you can move from a spreadsheet to a useful view without building every chart by hand.</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-[#fbfcfe] p-5 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5">
              <div className="flex items-center justify-between"><span className="rounded-xl bg-emerald-50 p-3 text-emerald-700">{createElement(Icon, { size: 21 })}</span><span className="text-sm font-semibold text-slate-300">0{index + 1}</span></div>
              <h3 className="mt-5 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-slate-950 px-6 py-9 text-white sm:px-10 sm:py-12 md:flex-row md:items-center">
        <div className="max-w-2xl"><p className="text-sm font-medium text-emerald-300">Ready when you are</p><h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Give your next spreadsheet a clearer story.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Create an account to upload a workbook and start exploring.</p></div>
        <Link to="/signup" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-400">Create your account <ArrowRight size={18} /></Link>
      </div>
      <footer className="mx-auto mt-8 max-w-7xl text-center text-xs text-slate-400">Excel Analytics · A simpler way to explore spreadsheet data</footer>
    </section>
  </main>
);

export default Home;
