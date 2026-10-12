import React, { useState, useEffect } from "react";
import axios from "axios";
import { IconX, IconSparkles, IconCopy, IconCheck } from "./Icons";

export default function AcceptanceCriteriaModal({
  isOpen,
  requirementItem,
  onClose,
  onCopyText,
}) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    if (!isOpen || !requirementItem) return;

    // If item already has precomputed acceptanceCriteria, use it
    if (requirementItem.acceptanceCriteria && requirementItem.acceptanceCriteria.length > 0) {
      setScenarios(requirementItem.acceptanceCriteria);
    } else {
      // Fetch dynamic criteria from backend
      fetchCriteria(requirementItem.requirement);
    }
  }, [isOpen, requirementItem]);

  const fetchCriteria = async (reqText) => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3000/api/acceptance-criteria", {
        requirement: reqText,
      });
      if (res.data?.scenarios) {
        setScenarios(res.data.scenarios);
      }
    } catch (err) {
      console.error("Failed to generate criteria:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !requirementItem) return null;

  const handleCopyScenario = (scenario, idx) => {
    const text = `Scenario: ${scenario.title || scenario.scenario}\n  Given ${scenario.given}\n  When ${scenario.when}\n  Then ${scenario.then}`;
    onCopyText(text, "Scenario copied in Gherkin BDD format");
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    let full = `# BDD Acceptance Criteria for ${requirementItem.id || "Requirement"}\n`;
    full += `Requirement: ${requirementItem.requirement}\n\n`;
    scenarios.forEach((s) => {
      full += `Scenario: ${s.title || s.scenario}\n`;
      full += `  Given ${s.given}\n`;
      full += `  When ${s.when}\n`;
      full += `  Then ${s.then}\n\n`;
    });
    onCopyText(full, "All BDD criteria copied to clipboard");
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon-badge modal-icon-primary">
              <IconSparkles size={18} color="#4f46e5" />
            </span>
            <div>
              <h3 className="modal-title">BDD Acceptance Criteria Generator</h3>
              <p className="modal-sub-label">Given / When / Then Test Scenarios</p>
            </div>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} aria-label="Close dialog">
            <IconX size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Selected Requirement Quote */}
          <div className="criteria-context-card">
            <div className="context-card-tag">{requirementItem.id || "REQUIREMENT"}</div>
            <p className="context-card-text">"{requirementItem.requirement}"</p>
          </div>

          {loading ? (
            <div className="criteria-loading-state">
              <div className="loading-spinner-sm" />
              <span>Synthesizing test scenarios from dependency trees...</span>
            </div>
          ) : scenarios.length === 0 ? (
            <p className="empty-message">No scenarios could be generated.</p>
          ) : (
            <div className="scenarios-list">
              {scenarios.map((s, idx) => (
                <div key={idx} className="scenario-card">
                  <div className="scenario-card-header">
                    <span className="scenario-num-tag">Scenario #{idx + 1}</span>
                    <span className="scenario-title">{s.title || s.scenario}</span>
                    <button
                      type="button"
                      className="btn-action-ghost btn-sm"
                      onClick={() => handleCopyScenario(s, idx)}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <IconCheck size={13} color="#10b981" />
                          <span style={{ color: "#10b981" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <IconCopy size={13} />
                          <span>Copy Gherkin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="gherkin-block">
                    <div className="gherkin-line">
                      <span className="gherkin-keyword">Given</span>
                      <span className="gherkin-clause">{s.given}</span>
                    </div>
                    <div className="gherkin-line">
                      <span className="gherkin-keyword">When</span>
                      <span className="gherkin-clause">{s.when}</span>
                    </div>
                    <div className="gherkin-line">
                      <span className="gherkin-keyword">Then</span>
                      <span className="gherkin-clause">{s.then}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleCopyAll} disabled={scenarios.length === 0}>
            Copy All Scenarios
          </button>
        </div>
      </div>
    </div>
  );
}
