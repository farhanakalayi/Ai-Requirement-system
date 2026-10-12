const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "history.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory records
let records = [];

function loadRecords() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      records = JSON.parse(data);
    } else {
      records = [];
      saveRecords();
    }
  } catch (err) {
    console.error("Error loading history DB, initializing empty:", err.message);
    records = [];
  }
}

function saveRecords() {
  try {
    const tempFile = DB_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error("Error saving history DB:", err.message);
    // Direct write fallback
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
  }
}

// Generate human-friendly title from text
function generateTitle(text) {
  if (!text) return "Untitled Requirement Analysis";
  // Clean first non-empty line
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "Untitled Requirement Analysis";
  
  let firstLine = lines[0]
    .replace(/^[•\-\*\>]\s*/, "")
    .replace(/^(REQ[-\d]+|Requirement\s*\d+|\d+[\.\)])\s*[:\-\.]?\s*/i, "")
    .trim();
  
  // Truncate cleanly
  if (firstLine.length > 55) {
    firstLine = firstLine.substring(0, 52).trim() + "...";
  }
  return firstLine || "Requirement Analysis Specification";
}

loadRecords();

const historyStore = {
  getAll() {
    return records
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((item) => ({
        id: item.id,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        summary: item.summary || {
          total: item.analysis?.requirements?.length || 0,
          high: item.analysis?.requirements?.filter((r) => r.priority === "High").length || 0,
          medium: item.analysis?.requirements?.filter((r) => r.priority === "Medium").length || 0,
          low: item.analysis?.requirements?.filter((r) => r.priority === "Low").length || 0,
          riskCount: item.analysis?.risks?.length || 0,
          clarityScore: item.analysis?.summary?.clarityScore || 85,
        },
        inputSnippet: (item.text || "").slice(0, 100),
      }));
  },

  getById(id) {
    return records.find((r) => r.id === id) || null;
  },

  create({ text, title, analysis }) {
    const id = "req_" + crypto.randomUUID().slice(0, 10);
    const resolvedTitle = title && title.trim() ? title.trim() : generateTitle(text);
    
    const summary = analysis?.summary || {
      total: analysis?.requirements?.length || (Array.isArray(analysis) ? analysis.length : 0),
      high: (analysis?.requirements || (Array.isArray(analysis) ? analysis : [])).filter((r) => r.priority === "High").length,
      medium: (analysis?.requirements || (Array.isArray(analysis) ? analysis : [])).filter((r) => r.priority === "Medium").length,
      low: (analysis?.requirements || (Array.isArray(analysis) ? analysis : [])).filter((r) => r.priority === "Low").length,
      riskCount: analysis?.risks?.length || 0,
      clarityScore: analysis?.summary?.clarityScore || 85,
    };

    const newRecord = {
      id,
      title: resolvedTitle,
      text,
      analysis,
      summary,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    records.unshift(newRecord);
    saveRecords();
    return newRecord;
  },

  rename(id, newTitle) {
    const record = records.find((r) => r.id === id);
    if (!record) return null;
    record.title = newTitle.trim();
    record.updatedAt = new Date().toISOString();
    saveRecords();
    return record;
  },

  delete(id) {
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return false;
    records.splice(index, 1);
    saveRecords();
    return true;
  },
};

module.exports = historyStore;
