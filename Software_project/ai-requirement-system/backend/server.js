const express = require("express");
const axios = require("axios");
const cors = require("cors");
const historyStore = require("./historyStore");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5000";

// Health check
app.get("/api/health", async (req, res) => {
  let aiStatus = "offline";
  try {
    const aiRes = await axios.get(`${AI_SERVICE_URL}/analyze`, { timeout: 1000 }).catch((e) => e.response);
    // If it responded 405 (method not allowed) or anything, Flask is running
    aiStatus = aiRes ? "online" : "offline";
  } catch {
    aiStatus = "offline";
  }
  res.json({ status: "ok", backend: "online", aiService: aiStatus });
});

// 1. Analyze Requirements (Existing endpoint upgraded with persistence & error handling)
app.post("/api/analyze", async (req, res) => {
  try {
    const { text, title, saveToHistory = true } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Requirements text cannot be empty" });
    }

    console.log(`[Analyze] Processing ${text.length} chars...`);

    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      text: text.trim(),
    }, {
      timeout: 30000,
    });

    const analysisData = response.data;

    let savedRecord = null;
    if (saveToHistory) {
      savedRecord = historyStore.create({
        text: text.trim(),
        title: title || undefined,
        analysis: analysisData,
      });
    }

    // Attach persistence metadata while preserving existing response structure
    const payload = {
      ...(typeof analysisData === "object" ? analysisData : { data: analysisData }),
      historyId: savedRecord ? savedRecord.id : null,
      title: savedRecord ? savedRecord.title : "Requirement Analysis",
      createdAt: savedRecord ? savedRecord.createdAt : new Date().toISOString(),
    };

    return res.json(payload);
  } catch (error) {
    console.error("[Analyze Error]:", error.message);
    const statusCode = error.response ? error.response.status : 500;
    return res.status(statusCode).json({
      error: "AI analysis service is unreachable or failed to process requirements",
      details: error.message,
    });
  }
});

// 2. History Endpoints
app.get("/api/history", (req, res) => {
  try {
    const list = historyStore.getAll();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve analysis history", details: err.message });
  }
});

app.get("/api/history/:id", (req, res) => {
  try {
    const record = historyStore.getById(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Analysis record not found" });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve record", details: err.message });
  }
});

app.post("/api/history", (req, res) => {
  try {
    const { text, title, analysis } = req.body;
    if (!text || !analysis) {
      return res.status(400).json({ error: "Text and analysis data are required" });
    }
    const created = historyStore.create({ text, title, analysis });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to save record", details: err.message });
  }
});

app.put("/api/history/:id", (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    const updated = historyStore.rename(req.params.id, title);
    if (!updated) {
      return res.status(404).json({ error: "Analysis record not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update record title", details: err.message });
  }
});

app.delete("/api/history/:id", (req, res) => {
  try {
    const success = historyStore.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: "Analysis record not found" });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete record", details: err.message });
  }
});

// 3. Compare Endpoint
app.post("/api/compare", async (req, res) => {
  try {
    const { oldText, newText } = req.body;
    if (!oldText || !newText) {
      return res.status(400).json({ error: "Both oldText and newText are required for comparison" });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/compare`, {
      oldText,
      newText,
    }, { timeout: 20000 });

    res.json(response.data);
  } catch (err) {
    console.error("[Compare Error]:", err.message);
    res.status(500).json({ error: "Failed to perform comparison", details: err.message });
  }
});

// 4. Acceptance Criteria Endpoint
app.post("/api/acceptance-criteria", async (req, res) => {
  try {
    const { requirement } = req.body;
    if (!requirement || !requirement.trim()) {
      return res.status(400).json({ error: "Requirement text is required" });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/acceptance-criteria`, {
      requirement,
    }, { timeout: 15000 });

    res.json(response.data);
  } catch (err) {
    console.error("[Acceptance Criteria Error]:", err.message);
    res.status(500).json({ error: "Failed to generate acceptance criteria", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express Backend running on port ${PORT}`));