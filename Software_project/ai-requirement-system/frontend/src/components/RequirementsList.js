import React, { useState } from "react";
import {
  IconSearch,
  IconCopy,
  IconSparkles,
  IconCheck,
} from "./Icons";

export default function RequirementsList({
  requirements = [],
  onOpenAcceptanceCriteria,
  onCopyItem,
}) {
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"
  const [copiedId, setCopiedId] = useState(null);

  const filteredItems = requirements.filter((item) => {
    // Priority filter
    if (priorityFilter !== "ALL" && item.priority?.toUpperCase() !== priorityFilter) {
      return false;
    }
    // Search text filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const textMatch = (item.requirement || "").toLowerCase().includes(q);
      const catMatch = (item.category || "").toLowerCase().includes(q);
      const classMatch = (item.classification || "").toLowerCase().includes(q);
      return textMatch || catMatch || classMatch;
    }
    return true;
  });

  const handleCopy = (item) => {
    onCopyItem(item);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const highCount = requirements.filter((r) => r.priority === "High").length;
  const medCount = requirements.filter((r) => r.priority === "Medium").length;
  const lowCount = requirements.filter((r) => r.priority === "Low").length;

  return (
    <div className="requirements-section-card">
      <div className="section-card-header">
        <div className="section-title-wrap">
          <h3 className="section-title">Prioritized Requirements Specification</h3>
          <span className="section-subtitle">
            Showing {filteredItems.length} of {requirements.length} statements
          </span>
        </div>

        {/* View Toggle */}
        <div className="view-mode-toggle">
          <button
            type="button"
            className={`btn-view-toggle ${viewMode === "cards" ? "active" : ""}`}
            onClick={() => setViewMode("cards")}
          >
            Card View
          </button>
          <button
            type="button"
            className={`btn-view-toggle ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
          >
            Table View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-search-toolbar">
        <div className="priority-pills-row">
          <button
            type="button"
            className={`filter-pill ${priorityFilter === "ALL" ? "pill-active" : ""}`}
            onClick={() => setPriorityFilter("ALL")}
          >
            All ({requirements.length})
          </button>
          <button
            type="button"
            className={`filter-pill pill-high ${priorityFilter === "HIGH" ? "pill-active" : ""}`}
            onClick={() => setPriorityFilter("HIGH")}
          >
            High ({highCount})
          </button>
          <button
            type="button"
            className={`filter-pill pill-med ${priorityFilter === "MEDIUM" ? "pill-active" : ""}`}
            onClick={() => setPriorityFilter("MEDIUM")}
          >
            Medium ({medCount})
          </button>
          <button
            type="button"
            className={`filter-pill pill-low ${priorityFilter === "LOW" ? "pill-active" : ""}`}
            onClick={() => setPriorityFilter("LOW")}
          >
            Low ({lowCount})
          </button>
        </div>

        <div className="table-search-box">
          <IconSearch size={14} color="#94a3b8" />
          <input
            type="text"
            className="table-search-input"
            placeholder="Filter requirements by keyword..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Content Rendering */}
      {filteredItems.length === 0 ? (
        <div className="empty-filter-state">
          <p>No requirements match the selected filters.</p>
          <button
            className="btn-toolbar-ghost"
            onClick={() => {
              setPriorityFilter("ALL");
              setSearchFilter("");
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* Detailed Cards View */
        <div className="requirements-cards-list">
          {filteredItems.map((item, index) => {
            const priorityClass =
              item.priority === "High"
                ? "badge-prio-high"
                : item.priority === "Medium"
                ? "badge-prio-medium"
                : "badge-prio-low";

            return (
              <div key={item.id || index} className="requirement-detail-card">
                <div className="req-card-top-row">
                  <div className="req-tags-group">
                    <span className="req-id-badge">{item.id || `REQ-${index + 1}`}</span>
                    <span className={`badge-prio ${priorityClass}`}>{item.priority}</span>
                    <span className="badge-category">{item.category || "General"}</span>
                    <span className="badge-classification">
                      {item.classification || "Functional"}
                    </span>
                  </div>

                  <div className="req-card-actions">
                    <button
                      type="button"
                      className="btn-action-ghost"
                      onClick={() => onOpenAcceptanceCriteria(item)}
                      title="Generate testable Given-When-Then BDD acceptance criteria"
                    >
                      <IconSparkles size={14} color="#4f46e5" />
                      <span>Acceptance Criteria</span>
                    </button>

                    <button
                      type="button"
                      className="btn-action-ghost"
                      onClick={() => handleCopy(item)}
                      title="Copy requirement text"
                    >
                      {copiedId === item.id ? (
                        <>
                          <IconCheck size={14} color="#10b981" />
                          <span style={{ color: "#10b981" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <IconCopy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="req-statement-text">{item.requirement}</div>

                {/* Metadata Details (Reason, Business Impact, Dependencies) */}
                <div className="req-metadata-grid">
                  <div className="req-meta-block">
                    <span className="meta-label">Priority Rationale</span>
                    <p className="meta-value">{item.reason || "Determined by system rules"}</p>
                  </div>

                  <div className="req-meta-block">
                    <span className="meta-label">Business Impact</span>
                    <p className="meta-value">{item.businessImpact || "Core operational impact"}</p>
                  </div>

                  {item.dependencies && item.dependencies.length > 0 && (
                    <div className="req-meta-block">
                      <span className="meta-label">Dependencies / Key Entities</span>
                      <div className="meta-tags-list">
                        {item.dependencies.map((dep, dIdx) => (
                          <span key={dIdx} className="dep-tag">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table View */
        <div className="table-responsive-wrapper">
          <table className="requirements-table">
            <thead>
              <tr>
                <th style={{ width: "90px" }}>ID</th>
                <th style={{ width: "100px" }}>Priority</th>
                <th style={{ width: "130px" }}>Category</th>
                <th style={{ width: "130px" }}>Type</th>
                <th>Requirement Statement</th>
                <th style={{ width: "130px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => {
                const priorityClass =
                  item.priority === "High"
                    ? "badge-prio-high"
                    : item.priority === "Medium"
                    ? "badge-prio-medium"
                    : "badge-prio-low";

                return (
                  <tr key={item.id || index}>
                    <td>
                      <span className="req-id-badge">{item.id || `REQ-${index + 1}`}</span>
                    </td>
                    <td>
                      <span className={`badge-prio ${priorityClass}`}>{item.priority}</span>
                    </td>
                    <td>
                      <span className="badge-category">{item.category}</span>
                    </td>
                    <td>
                      <span className="badge-classification">{item.classification}</span>
                    </td>
                    <td>
                      <div className="table-req-text">{item.requirement}</div>
                      <div className="table-req-subtext">{item.reason}</div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="btn-action-ghost btn-sm"
                        onClick={() => onOpenAcceptanceCriteria(item)}
                        title="Acceptance Criteria"
                      >
                        <IconSparkles size={13} color="#4f46e5" />
                      </button>
                      <button
                        type="button"
                        className="btn-action-ghost btn-sm"
                        onClick={() => handleCopy(item)}
                        title="Copy"
                      >
                        <IconCopy size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
