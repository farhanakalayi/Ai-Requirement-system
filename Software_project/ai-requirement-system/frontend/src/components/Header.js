import React from "react";
import {
  IconMenu,
  IconGitCompare,
  IconDownload,
  IconPrinter,
  IconCopy,
} from "./Icons";

export default function Header({
  onOpenMobileSidebar,
  onOpenCompare,
  onExportJson,
  onPrintReport,
  onCopyMarkdown,
  hasResults,
  isAnalyzing,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="header-mobile-toggle mobile-only"
          onClick={onOpenMobileSidebar}
          aria-label="Open navigation sidebar"
        >
          <IconMenu size={20} />
        </button>

        <div className="header-titles">
          <div className="header-title-badge-row">
            <h1 className="header-main-title">AI Requirement Analyzer</h1>
            <span className="badge-system-status">
              <span className="status-indicator-dot" />
              NLP Ready
            </span>
          </div>
          <p className="header-subtitle">
            Transform raw requirements into actionable, prioritized insights.
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Version Compare button */}
        <button
          className="btn-header-secondary"
          onClick={onOpenCompare}
          title="Compare requirement revisions and semantic diff"
        >
          <IconGitCompare size={15} />
          <span className="desktop-text">Compare Versions</span>
        </button>

        {/* Export options (when results are available) */}
        {hasResults && (
          <div className="header-export-group">
            <button
              className="btn-header-secondary"
              onClick={onCopyMarkdown}
              title="Copy analysis report as formatted Markdown"
            >
              <IconCopy size={15} />
              <span className="desktop-text">Copy Markdown</span>
            </button>

            <button
              className="btn-header-secondary"
              onClick={onPrintReport}
              title="Print or save report as PDF"
            >
              <IconPrinter size={15} />
              <span className="desktop-text">PDF Report</span>
            </button>

            <button
              className="btn-header-primary"
              onClick={onExportJson}
              title="Export complete report as JSON"
            >
              <IconDownload size={15} />
              <span className="desktop-text">Export JSON</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
