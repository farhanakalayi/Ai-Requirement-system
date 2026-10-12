import React from "react";
import { IconAlertTriangle, IconCheckCircle } from "./Icons";

export default function RiskAnalysis({ risks = [] }) {
  if (risks.length === 0) {
    return (
      <div className="requirements-section-card">
        <div className="section-card-header">
          <div>
            <h3 className="section-title">Risk & Ambiguity Analysis</h3>
            <p className="section-subtitle">
              Scan for subjective terminology, passive voice, missing actors, and untestable claims
            </p>
          </div>
        </div>
        <div className="risk-clean-state">
          <div className="clean-icon-wrap">
            <IconCheckCircle size={32} color="#10b981" />
          </div>
          <h4 className="clean-title">No Critical Ambiguities Detected</h4>
          <p className="clean-desc">
            All statements contain specific active phrasing and measurable constraints.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="requirements-section-card">
      <div className="section-card-header">
        <div>
          <h3 className="section-title">Risk & Ambiguity Analysis</h3>
          <p className="section-subtitle">
            Identified {risks.length} specification smells, subjective terms, or missing verification criteria
          </p>
        </div>
      </div>

      <div className="risks-list">
        {risks.map((risk, index) => {
          const isHigh = risk.severity === "High";
          return (
            <div
              key={risk.id || index}
              className={`risk-card ${isHigh ? "risk-card-high" : "risk-card-moderate"}`}
            >
              <div className="risk-card-header">
                <div className="risk-header-left">
                  <span className={`risk-severity-pill ${isHigh ? "sev-high" : "sev-mod"}`}>
                    <IconAlertTriangle size={13} />
                    <span>{risk.severity || "Moderate"} Severity</span>
                  </span>
                  <span className="risk-type-tag">{risk.type}</span>
                  {risk.reqId && <span className="risk-req-ref">{risk.reqId}</span>}
                </div>
              </div>

              {/* Requirement context */}
              <div className="risk-statement-box">
                <span className="risk-box-label">Context Statement:</span>
                <p className="risk-statement-text">"{risk.requirement}"</p>
              </div>

              {/* Description & Impact */}
              <div className="risk-details-grid">
                <div className="risk-detail-col">
                  <span className="detail-col-heading">Detected Issue</span>
                  <p className="detail-col-text">{risk.description}</p>
                </div>
                <div className="risk-detail-col">
                  <span className="detail-col-heading">Why It Matters</span>
                  <p className="detail-col-text">{risk.whyItMatters}</p>
                </div>
              </div>

              {/* Practical Suggestion */}
              <div className="risk-suggestion-box">
                <span className="suggestion-icon">💡</span>
                <div className="suggestion-content">
                  <span className="suggestion-label">Actionable Improvement:</span>
                  <p className="suggestion-text">{risk.suggestion}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
