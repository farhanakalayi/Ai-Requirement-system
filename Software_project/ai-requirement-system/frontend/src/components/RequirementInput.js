import React, { useState } from "react";
import {
  IconSparkles,
  IconX,
  IconFileText,
  IconAlertTriangle,
} from "./Icons";
import { SAMPLES } from "../utils/samples";

export default function RequirementInput({
  text,
  onChangeText,
  onAnalyze,
  onClear,
  isAnalyzing,
  error,
}) {
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text.trim() ? text.trim().split("\n").length : 0;

  const handleSelectSample = (sample) => {
    onChangeText(sample.text);
    setShowSampleMenu(false);
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isAnalyzing && text.trim()) {
        onAnalyze();
      }
    }
  };

  return (
    <section className="input-card" aria-label="Requirements input workspace">
      <div className="input-card-header">
        <div className="input-header-left">
          <span className="input-icon-pill">
            <IconFileText size={16} color="#4f46e5" />
          </span>
          <div>
            <h2 className="input-section-title">Requirements Specification</h2>
            <p className="input-section-hint">
              Enter user stories, system constraints, or PRD bullet points. (Press Ctrl+Enter to analyze)
            </p>
          </div>
        </div>

        {/* Sample Templates & Clear toolbar */}
        <div className="input-toolbar-actions">
          <div className="sample-dropdown-container">
            <button
              type="button"
              className="btn-toolbar-secondary"
              onClick={() => setShowSampleMenu(!showSampleMenu)}
              aria-expanded={showSampleMenu}
            >
              <span>Load Sample</span>
              <span className="dropdown-caret">▾</span>
            </button>

            {showSampleMenu && (
              <div
                className="sample-menu-dropdown"
                onMouseLeave={() => setShowSampleMenu(false)}
              >
                <div className="sample-menu-header">Select Prebuilt PRD</div>
                {SAMPLES.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    className="sample-menu-item"
                    onClick={() => handleSelectSample(sample)}
                  >
                    <div className="sample-item-title">{sample.name}</div>
                    <div className="sample-item-desc">{sample.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {text && (
            <button
              type="button"
              className="btn-toolbar-ghost"
              onClick={onClear}
              title="Clear input contents"
            >
              <IconX size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="textarea-wrapper">
        <textarea
          className="requirements-textarea"
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enter your product requirements here (e.g.):
1. The user must be able to log in securely using multi-factor authentication.
2. The checkout page should load within 800 milliseconds under 5,000 concurrent users.
3. The system may offer dark mode in future releases.
4. Passwords must be hashed using bcrypt with work factor 12.`}
          rows={7}
          aria-label="Requirements text input"
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="input-error-alert" role="alert">
          <IconAlertTriangle size={16} color="#ef4444" />
          <span className="error-text">{error}</span>
        </div>
      )}

      {/* Footer with stats & Primary Analyze Button */}
      <div className="input-card-footer">
        <div className="input-metrics-bar">
          <span className="metric-tag">{charCount.toLocaleString()} chars</span>
          <span className="metric-tag">{wordCount.toLocaleString()} words</span>
          <span className="metric-tag">{lineCount.toLocaleString()} lines</span>
        </div>

        <div className="input-submit-wrap">
          <button
            type="button"
            className="btn-primary btn-analyze"
            onClick={onAnalyze}
            disabled={isAnalyzing || !text.trim()}
          >
            {isAnalyzing ? (
              <>
                <div className="loading-spinner-sm" />
                <span>Running spaCy NLP Engine...</span>
              </>
            ) : (
              <>
                <IconSparkles size={16} />
                <span>Analyze Requirements</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
