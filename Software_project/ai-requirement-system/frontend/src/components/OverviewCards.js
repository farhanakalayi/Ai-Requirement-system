import React, { useState } from "react";
import {
  IconFileText,
  IconShield,
  IconGauge,
  IconAlertTriangle,
  IconSparkles,
} from "./Icons";

export default function OverviewCards({ summary, risksCount = 0 }) {
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const total = summary?.total || 0;
  const high = summary?.high || 0;
  const medium = summary?.medium || 0;
  const low = summary?.low || 0;
  const clarityScore = summary?.clarityScore || 85;
  const explanation = summary?.clarityExplanation || "Measures requirement specificity, actor accountability, absence of subjective terms, and testability.";

  return (
    <div className="overview-cards-grid">
      {/* 1. Total Requirements */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Requirements</span>
          <span className="stat-icon-wrap stat-icon-blue">
            <IconFileText size={18} color="#2563eb" />
          </span>
        </div>
        <div className="stat-value">{total}</div>
        <div className="stat-footer-text">Identified statements</div>
      </div>

      {/* 2. High Priority */}
      <div className="stat-card stat-card-high">
        <div className="stat-card-header">
          <span className="stat-label">High Priority</span>
          <span className="stat-icon-wrap stat-icon-red">
            <IconShield size={18} color="#dc2626" />
          </span>
        </div>
        <div className="stat-value color-danger">{high}</div>
        <div className="stat-footer-text">
          {total > 0 ? `${Math.round((high / total) * 100)}% of scope` : "Mandatory constraints"}
        </div>
      </div>

      {/* 3. Medium Priority */}
      <div className="stat-card stat-card-medium">
        <div className="stat-card-header">
          <span className="stat-label">Medium Priority</span>
          <span className="stat-icon-wrap stat-icon-amber">
            <IconGauge size={18} color="#d97706" />
          </span>
        </div>
        <div className="stat-value color-warning">{medium}</div>
        <div className="stat-footer-text">
          {total > 0 ? `${Math.round((medium / total) * 100)}% of scope` : "Important capabilities"}
        </div>
      </div>

      {/* 4. Low Priority */}
      <div className="stat-card stat-card-low">
        <div className="stat-card-header">
          <span className="stat-label">Low Priority</span>
          <span className="stat-icon-wrap stat-icon-green">
            <IconSparkles size={18} color="#059669" />
          </span>
        </div>
        <div className="stat-value color-success">{low}</div>
        <div className="stat-footer-text">
          {total > 0 ? `${Math.round((low / total) * 100)}% of scope` : "Optional enhancements"}
        </div>
      </div>

      {/* 5. Identified Risks / Ambiguities */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Risks & Ambiguities</span>
          <span className="stat-icon-wrap stat-icon-amber">
            <IconAlertTriangle size={18} color="#d97706" />
          </span>
        </div>
        <div className="stat-value color-warning">{risksCount}</div>
        <div className="stat-footer-text">Subjective terms & passive smells</div>
      </div>

      {/* 6. Clarity Score */}
      <div className="stat-card stat-card-score">
        <div className="stat-card-header">
          <div className="stat-label-row">
            <span className="stat-label">Clarity Score</span>
            <button
              type="button"
              className="info-tooltip-trigger"
              onClick={() => setShowScoreInfo(!showScoreInfo)}
              title="Explain clarity score calculation"
              aria-label="Explain clarity score"
            >
              ℹ
            </button>
          </div>
          <span className="stat-icon-wrap stat-icon-purple">
            <span className="score-percent-symbol">%</span>
          </span>
        </div>
        <div className="stat-value-score-row">
          <span className="stat-value">{clarityScore}</span>
          <span className="stat-denom">/100</span>
        </div>
        <div className="stat-footer-text">
          {clarityScore >= 80 ? "Well-specified PRD" : clarityScore >= 60 ? "Moderate ambiguity" : "Requires revision"}
        </div>

        {/* Explain tooltip modal */}
        {showScoreInfo && (
          <div className="score-info-popup">
            <div className="score-info-title">Clarity Metric Formula</div>
            <p className="score-info-desc">{explanation}</p>
            <div className="score-info-factors">
              <div>✓ Specific numbers & criteria (+4)</div>
              <div>✓ Explicit subject actors (+2)</div>
              <div>✕ Subjective adjectives (-5)</div>
              <div>✕ Passive voice (-6)</div>
            </div>
            <button
              type="button"
              className="score-info-close"
              onClick={() => setShowScoreInfo(false)}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
