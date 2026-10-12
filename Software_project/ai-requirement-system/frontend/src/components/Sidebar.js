import React, { useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconEdit,
  IconSparkles,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconFileText,
} from "./Icons";
import { formatRelativeTime } from "../utils/export";

export default function Sidebar({
  history,
  activeId,
  isLoadingHistory,
  isOpenMobile,
  isCollapsed,
  onToggleCollapse,
  onCloseMobile,
  onSelectHistory,
  onNewAnalysis,
  onRequestRename,
  onRequestDelete,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (item.title || "").toLowerCase().includes(q);
    const snippetMatch = (item.inputSnippet || "").toLowerCase().includes(q);
    return titleMatch || snippetMatch;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${isCollapsed ? "sidebar-collapsed" : ""} ${
          isOpenMobile ? "sidebar-mobile-open" : ""
        }`}
      >
        {/* Brand header */}
        <div className="sidebar-brand">
          <div className="brand-logo-wrap">
            <span className="brand-icon-box">
              <IconSparkles size={20} color="#ffffff" />
            </span>
            {!isCollapsed && (
              <div className="brand-text-block">
                <span className="brand-title">Requirement AI</span>
                <span className="brand-tag">SaaS v2.0</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse toggle button */}
          <button
            className="sidebar-collapse-btn desktop-only"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
          </button>

          {/* Mobile close button */}
          <button
            className="sidebar-mobile-close mobile-only"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* New Analysis button */}
        <div className="sidebar-action-wrap">
          <button
            className="btn-new-analysis"
            onClick={() => {
              onNewAnalysis();
              if (isOpenMobile) onCloseMobile();
            }}
            title="Start new requirements analysis"
          >
            <IconPlus size={18} color="#ffffff" />
            {!isCollapsed && <span>New Analysis</span>}
          </button>
        </div>

        {/* History Section */}
        {!isCollapsed && (
          <div className="sidebar-history-container">
            <div className="history-header">
              <span className="history-heading">Analysis History</span>
              {history.length > 0 && (
                <span className="history-count-badge">{history.length}</span>
              )}
            </div>

            {/* Search Input */}
            <div className="history-search-box">
              <IconSearch size={14} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="history-search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <IconX size={12} />
                </button>
              )}
            </div>

            {/* History List */}
            <div className="history-list-scroll">
              {isLoadingHistory ? (
                <div className="history-loading-state">
                  <div className="loading-spinner-sm" />
                  <span>Loading history...</span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="history-empty-state">
                  <IconFileText size={24} color="#cbd5e1" />
                  <p className="empty-state-title">
                    {searchQuery ? "No matching records" : "No past analyses"}
                  </p>
                  <p className="empty-state-subtitle">
                    {searchQuery
                      ? "Try a different search keyword."
                      : "Run an analysis to build your history."}
                  </p>
                </div>
              ) : (
                <ul className="history-list">
                  {filteredHistory.map((item) => {
                    const isActive = item.id === activeId;
                    const relativeTime = formatRelativeTime(item.createdAt);
                    const totalReqs = item.summary?.total || 0;
                    const highCount = item.summary?.high || 0;

                    return (
                      <li
                        key={item.id}
                        className={`history-item ${isActive ? "history-item-active" : ""}`}
                        onClick={() => {
                          onSelectHistory(item.id);
                          if (isOpenMobile) onCloseMobile();
                        }}
                      >
                        <div className="history-item-main">
                          <span className="history-item-title" title={item.title}>
                            {item.title}
                          </span>
                          <div className="history-item-meta">
                            <span className="history-item-time">{relativeTime}</span>
                            <span className="history-pill">
                              {totalReqs} {totalReqs === 1 ? "req" : "reqs"}
                            </span>
                            {highCount > 0 && (
                              <span className="history-pill history-pill-high">
                                {highCount} High
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions (Rename / Delete) */}
                        <div
                          className="history-item-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="history-action-btn"
                            title="Rename"
                            onClick={() => onRequestRename(item)}
                            aria-label={`Rename ${item.title}`}
                          >
                            <IconEdit size={13} />
                          </button>
                          <button
                            className="history-action-btn history-action-danger"
                            title="Delete"
                            onClick={() => onRequestDelete(item)}
                            aria-label={`Delete ${item.title}`}
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Collapsed view indicator */}
        {isCollapsed && (
          <div className="sidebar-collapsed-hint">
            <span className="collapsed-count">{history.length}</span>
            <span className="collapsed-label">Saved</span>
          </div>
        )}
      </aside>
    </>
  );
}
