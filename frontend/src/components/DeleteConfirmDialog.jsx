import { useEffect, useRef } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

const DeleteConfirmDialog = ({ open, filename, busy = false, onCancel, onConfirm }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4" role="presentation">
      <button type="button" aria-label="Cancel file deletion" onClick={() => !busy && onCancel()} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]" />
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-file-title" aria-describedby="delete-file-description" className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-6">
        <div className="flex items-start gap-3.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100"><Trash2 size={19} /></span>
          <div className="min-w-0 pt-0.5"><h2 id="delete-file-title" className="text-base font-semibold text-slate-950">Delete this workbook?</h2><p id="delete-file-description" className="mt-1.5 text-sm leading-5 text-slate-600">This will permanently remove the workbook and its saved analysis from your history.</p></div>
        </div>
        {filename && <div className="mt-4 truncate rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700" title={filename}>{filename}</div>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-500/10 disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 disabled:cursor-wait disabled:opacity-70">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={15} />}{busy ? "Deleting…" : "Delete workbook"}</button>
        </div>
      </section>
    </div>
  );
};

export default DeleteConfirmDialog;
