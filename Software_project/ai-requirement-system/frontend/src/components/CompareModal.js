import React, { useState } from "react";
import axios from "axios";
import { IconX, IconGitCompare, IconAlertTriangle } from "./Icons";

export default function CompareModal({
  isOpen,
  currentText = "",
  history = [],
  onClose,
  onApplyNewText,
}) {
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [customOldText, setCustomOldText] = useState("");
  const [customNewText, setCustomNewText] = useState(currentText);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSelectHistory = async (id) => {
    setSelectedHistoryId(id);
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:3000/api/history/${id}`);
      if (res.data?.text) {
        setCustomOldText(res.data.text);
      }
    } catch (err) {
      console.error("Error fetching history record:", err);
    }
  };

  const handleRunCompare = async () => {
    const oldText = customOldText.trim();
    const newText = customNewText.trim();

    if (!oldText || !newText) {
      setError("Please provide both baseline (Version A) and revised (Version B) requirements text.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await axios.post("http://localhost:3000/api/compare", {
        oldText,
        newText,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Compare error:", err);
      setError("Comparison failed. Please verify that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-card-xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon-badge modal-icon-primary">
              <IconGitCompare size={18} color="#4f46e5" />
            </span>
            <div>
              <h3 className="modal-title">Requirement Version Diff & Semantic Compare</h3>
              <p className="modal-sub-label">
                Detect additions, removals, and modifications between specifications
              </p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} aria-label="Close dialog">
            <IconX size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Version Inputs */}
          <div className="compare-inputs-grid">
            {/* Version A (Baseline) */}
            <div className="compare-col">
              <div className="compare-col-header">
                <span className="col-version-badge badge-ver-old">Version A (Baseline)</span>
                {history.length > 0 && (
                  <select
                    className="history-select-dropdown"
                    value={selectedHistoryId}
                    onChange={(e) => handleSelectHistory(e.target.value)}
                  >
                    <option value="">-- Choose from History --</option>
                    {history.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <textarea
                className="compare-textarea"
                rows={6}
                value={customOldText}
                onChange={(e) => setCustomOldText(e.target.value)}
                placeholder="Paste original baseline requirements..."
              />
            </div>

            {/* Version B (Revision) */}
            <div className="compare-col">
              <div className="compare-col-header">
                <span className="col-version-badge badge-ver-new">Version B (Revision)</span>
                <span className="col-hint">Current workspace text</span>
              </div>
              <textarea
                className="compare-textarea"
                rows={6}
                value={customNewText}
                onChange={(e) => setCustomNewText(e.target.value)}
                placeholder="Paste revised requirements..."
              />
            </div>
          </div>

          <div className="compare-trigger-row">
            {error && (
              <span className="compare-error-text">
                <IconAlertTriangle size={14} /> {error}
              </span>
            )}
            <button
              className="btn-primary"
              onClick={handleRunCompare}
              disabled={loading || !customOldText.trim() || !customNewText.trim()}
            >
              {loading ? "Comparing Versions..." : "Run Semantic Diff"}
            </button>
          </div>

          {/* Comparison Results */}
          {result && (
            <div className="compare-results-section">
              {/* Summary Stats */}
              <div className="diff-summary-bar">
                <span className="diff-stat-chip diff-added">
                  +{result.summary?.addedCount || 0} Added
                </span>
                <span className="diff-stat-chip diff-removed">
                  -{result.summary?.removedCount || 0} Removed
                </span>
                <span className="diff-stat-chip diff-modified">
                  ~{result.summary?.modifiedCount || 0} Modified
                </span>
                <span className="diff-stat-chip diff-unchanged">
                  ={result.summary?.unchangedCount || 0} Unchanged
                </span>
              </div>

              {/* Diff Breakdown */}
              <div className="diff-details-scroll">
                {/* Modified items */}
                {result.modified?.length > 0 && (
                  <div className="diff-group">
                    <h5 className="diff-group-title text-amber">
                      Modified Requirements ({result.modified.length})
                    </h5>
                    {result.modified.map((item, idx) => (
                      <div key={idx} className="diff-item-card diff-card-modified">
                        <div className="diff-sim-badge">{item.similarity}% match</div>
                        <div className="diff-sub-row text-diff-old">
                          <span className="diff-tag">- Old:</span> {item.oldRequirement}
                        </div>
                        <div className="diff-sub-row text-diff-new">
                          <span className="diff-tag">+ New:</span> {item.newRequirement}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Added items */}
                {result.added?.length > 0 && (
                  <div className="diff-group">
                    <h5 className="diff-group-title text-green">
                      Added Requirements ({result.added.length})
                    </h5>
                    {result.added.map((item, idx) => (
                      <div key={idx} className="diff-item-card diff-card-added">
                        <span className="diff-plus-symbol">+</span> {item.requirement}
                      </div>
                    ))}
                  </div>
                )}

                {/* Removed items */}
                {result.removed?.length > 0 && (
                  <div className="diff-group">
                    <h5 className="diff-group-title text-red">
                      Removed Requirements ({result.removed.length})
                    </h5>
                    {result.removed.map((item, idx) => (
                      <div key={idx} className="diff-item-card diff-card-removed">
                        <span className="diff-minus-symbol">-</span> {item.requirement}
                      </div>
                    ))}
                  </div>
                )}

                {/* Unchanged items */}
                {result.unchanged?.length > 0 && (
                  <div className="diff-group">
                    <h5 className="diff-group-title text-slate">
                      Unchanged Requirements ({result.unchanged.length})
                    </h5>
                    {result.unchanged.map((item, idx) => (
                      <div key={idx} className="diff-item-card diff-card-unchanged">
                        <span className="diff-eq-symbol">=</span> {item.requirement}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
