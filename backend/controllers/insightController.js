import mongoose from "mongoose";
import Upload from "../models/Upload.js";

const parseNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  let normalized = value.trim().replace(/[,$₹€£¥\s]/g, "").replace(/%$/, "");
  if (!normalized) return null;
  if (/^\(.*\)$/.test(normalized)) normalized = `-${normalized.slice(1, -1)}`;
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const formatNumber = (value) => Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const isBlank = (value) => value === null || value === undefined || (typeof value === "string" && !value.trim());
const parseDateCell = (value) => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number" && value >= 1 && value <= 100000) return new Date(Date.UTC(1899, 11, 30) + value * 86400000);
  if (typeof value === "string" && /^\d{4}$/.test(value.trim())) return new Date(`${value.trim()}-01-01T00:00:00Z`);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const makeColumnStats = (rows, column) => {
  const values = rows.map((row) => parseNumber(row?.[column])).filter((value) => value !== null);
  if (!values.length) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  const { min, max } = values.reduce((range, value) => ({ min: Math.min(range.min, value), max: Math.max(range.max, value) }), { min: values[0], max: values[0] });
  return {
    count: values.length,
    sum,
    average: sum / values.length,
    min,
    max,
  };
};

const buildInsights = (rows, columns, metrics) => {
  const insights = [{
    title: "Workbook overview",
    detail: `Your sheet has ${rows.length.toLocaleString()} records (rows) and ${columns.length} fields (columns). Fields: ${columns.join(", ")}.`,
  }];

  const numericColumns = Object.keys(metrics);
  if (numericColumns.length) {
    const numericDetails = numericColumns.slice(0, 3).map((column) => {
      const stats = metrics[column];
      return `${column}: the average is ${formatNumber(stats.average)} per row; the lowest value is ${formatNumber(stats.min)} and the highest is ${formatNumber(stats.max)}${stats.count < rows.length ? ` (${stats.count.toLocaleString()} rows had a number)` : ""}`;
    });
    insights.push({ title: "Numeric columns", detail: `${numericDetails.join(". ")}.${numericColumns.length > 3 ? ` ${numericColumns.length - 3} more numeric columns are available.` : ""}` });
  } else {
    insights.push({ title: "Numeric data", detail: "No numeric columns were detected, so charts can compare categories or count rows instead of measuring numeric values." });
  }

  const categoryHighlights = columns.flatMap((column) => {
    const values = rows.map((row) => row?.[column]).filter((value) => !isBlank(value));
    if (!values.length || values.some((value) => parseNumber(value) !== null)) return [];
    const counts = new Map();
    values.forEach((value) => {
      const label = String(value).trim();
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    if (counts.size < 2 || counts.size > Math.max(30, rows.length * 0.8)) return [];
    const [label, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return [{ column, label, count, share: (count / values.length) * 100 }];
  }).sort((a, b) => b.share - a.share);
  if (categoryHighlights.length) {
    const top = categoryHighlights[0];
    insights.push({ title: "Most common category", detail: `“${top.label}” is the most common value in “${top.column}”: it appears in ${top.count.toLocaleString()} of ${rows.length.toLocaleString()} rows (${formatNumber(top.share)}%).` });
  }

  const dateColumn = columns.find((column) => /date|time/i.test(column));
  if (dateColumn) {
    const dates = rows.map((row) => parseDateCell(row?.[dateColumn])).filter(Boolean);
    if (dates.length) {
      const { min, max } = dates.reduce((range, date) => ({ min: date < range.min ? date : range.min, max: date > range.max ? date : range.max }), { min: dates[0], max: dates[0] });
      const displayDate = (date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      insights.push({ title: "Date coverage", detail: `The “${dateColumn}” values run from ${displayDate(min)} to ${displayDate(max)} (${dates.length.toLocaleString()} valid dates).` });
    }
  }

  const missingByColumn = columns.map((column) => ({ column, count: rows.filter((row) => isBlank(row?.[column])).length })).filter((item) => item.count > 0);
  const missingCount = missingByColumn.reduce((total, item) => total + item.count, 0);
  const cellCount = rows.length * columns.length;
  if (missingCount) {
    const mostMissing = missingByColumn.sort((a, b) => b.count - a.count)[0];
    insights.push({ title: "Data completeness", detail: `${missingCount.toLocaleString()} of ${cellCount.toLocaleString()} cells are blank (${formatNumber((missingCount / cellCount) * 100)}%). “${mostMissing.column}” has the most blanks (${mostMissing.count.toLocaleString()}).` });
  } else {
    insights.push({ title: "Data completeness", detail: `All ${cellCount.toLocaleString()} cells in the uploaded rows contain a value.` });
  }

  return insights;
};

// GET /api/insights/:uploadId
export const getInsightSummary = async (req, res) => {
  try {
    const { uploadId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(uploadId)) return res.status(400).json({ message: "Invalid upload ID" });

    const upload = await Upload.findOne({ _id: uploadId, user: req.user.id });
    if (!upload) return res.status(404).json({ message: "Workbook not found in your history" });
    if (upload.status !== "success") return res.status(422).json({ message: "This workbook did not upload successfully. Upload it again before analyzing." });

    const rows = Array.isArray(upload.parsedData) ? upload.parsedData : [];
    if (!rows.length) return res.status(200).json({ filename: upload.filename, rowCount: 0, columnCount: 0, metrics: {}, insights: [], summary: "No data rows were found in this workbook.", summarySource: "built-in" });

    const columns = [...new Set(rows.flatMap((row) => row && typeof row === "object" ? Object.keys(row) : []))];
    const metrics = Object.fromEntries(columns.map((column) => [column, makeColumnStats(rows, column)]).filter(([, stats]) => stats));
    const insights = buildInsights(rows, columns, metrics);
    const summary = insights.map(({ title, detail }) => `${title}: ${detail}`).join("\n\n");

    return res.json({
      filename: upload.filename,
      rowCount: rows.length,
      columnCount: columns.length,
      metrics,
      insights,
      summary,
      summarySource: "built-in",
    });
  } catch (error) {
    console.error("Insight error:", error);
    return res.status(500).json({ message: "Failed to generate insights" });
  }
};
