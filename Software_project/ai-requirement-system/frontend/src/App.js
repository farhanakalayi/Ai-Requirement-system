import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import RequirementInput from "./components/RequirementInput";
import OverviewCards from "./components/OverviewCards";
import RequirementsList from "./components/RequirementsList";
import RiskAnalysis from "./components/RiskAnalysis";
import ClassificationBreakdown from "./components/ClassificationBreakdown";
import Recommendations from "./components/Recommendations";
import AcceptanceCriteriaModal from "./components/AcceptanceCriteriaModal";
import CompareModal from "./components/CompareModal";
import ConfirmModal from "./components/ConfirmModal";
import RenameModal from "./components/RenameModal";
import Toast from "./components/Toast";
import { exportToJson, generateMarkdownReport } from "./utils/export";

const API_BASE = "http://localhost:3000";

function App() {
  // State
  const [text, setText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  // Tabs for Dashboard
  const [activeTab, setActiveTab] = useState("requirements"); // "requirements", "risks", "classification", "recommendations"

  // Responsive Sidebar state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [selectedCriteriaItem, setSelectedCriteriaItem] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordToRename, setRecordToRename] = useState(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // 1. Fetch History from Backend
  const loadHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await axios.get(`${API_BASE}/api/history`);
      if (Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.error("Failed to load history:", err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 2. Select and Reopen a History item
  const handleSelectHistory = async (id) => {
    if (!id) return;
    try {
      setError("");
      const res = await axios.get(`${API_BASE}/api/history/${id}`);
      const record = res.data;
      if (record) {
        setText(record.text || "");
        setAnalysisResult(record.analysis || null);
        setActiveHistoryId(record.id);
        setActiveTab("requirements");
        showToast(`Loaded analysis: "${record.title}"`, "info");
      }
    } catch (err) {
      console.error("Failed to open history item:", err);
      showToast("Failed to load history record", "error");
    }
  };

  // 3. Start a New Analysis
  const handleNewAnalysis = () => {
    setText("");
    setAnalysisResult(null);
    setActiveHistoryId(null);
    setError("");
    setActiveTab("requirements");
    showToast("Started fresh analysis workspace", "info");
  };

  // 4. Run Analysis
  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter requirements before analyzing.");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError("");

      const res = await axios.post(`${API_BASE}/api/analyze`, {
        text: text.trim(),
        saveToHistory: true,
      });

      const data = res.data;
      setAnalysisResult(data);

      if (data.historyId) {
        setActiveHistoryId(data.historyId);
      }

      // Refresh history list immediately
      await loadHistory();
      showToast("Requirements analyzed & saved to history!", "success");
    } catch (err) {
      console.error("Analysis failed:", err);
      const errMsg =
        err.response?.data?.error ||
        "Analysis engine unreachable. Please ensure the Python & Express servers are active.";
      setError(errMsg);
      showToast("Analysis failed: " + errMsg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 5. Delete History Record
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await axios.delete(`${API_BASE}/api/history/${recordToDelete.id}`);
      showToast(`Deleted "${recordToDelete.title}"`, "info");

      // If we deleted the active item, start clean
      if (activeHistoryId === recordToDelete.id) {
        handleNewAnalysis();
      }

      setRecordToDelete(null);
      await loadHistory();
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete record", "error");
    }
  };

  // 6. Rename History Record
  const handleSaveRename = async (newTitle) => {
    if (!recordToRename) return;
    try {
      await axios.put(`${API_BASE}/api/history/${recordToRename.id}`, {
        title: newTitle,
      });
      showToast("Title updated successfully", "success");

      // Update current analysis title if active
      if (activeHistoryId === recordToRename.id && analysisResult) {
        setAnalysisResult((prev) => ({
          ...prev,
          title: newTitle,
        }));
      }

      setRecordToRename(null);
      await loadHistory();
    } catch (err) {
      console.error("Rename failed:", err);
      showToast("Failed to rename record", "error");
    }
  };

  // 7. Clear Input
  const handleClearInput = () => {
    if (text.length > 50) {
      setIsClearConfirmOpen(true);
    } else {
      setText("");
    }
  };

  // 8. Export Actions
  const handleExportJson = () => {
    if (!analysisResult) return;
    const exportData = {
      id: activeHistoryId,
      title: analysisResult.title || "Requirements Analysis Report",
      createdAt: analysisResult.createdAt || new Date().toISOString(),
      rawInput: text,
      analysis: analysisResult,
    };
    exportToJson(exportData, `requirement-analysis-${activeHistoryId || "export"}.json`);
    showToast("JSON report downloaded successfully", "success");
  };

  const handleCopyMarkdown = () => {
    if (!analysisResult) return;
    const reportData = {
      title: analysisResult.title || "AI Requirement Analysis Report",
      createdAt: analysisResult.createdAt,
      analysis: analysisResult,
    };
    const md = generateMarkdownReport(reportData);
    navigator.clipboard.writeText(md);
    showToast("Full report copied as Markdown to clipboard!", "success");
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleCopyItem = (item) => {
    const textToCopy = `[${item.id || "REQ"}] (${item.priority} | ${item.category}) ${item.requirement}`;
    navigator.clipboard.writeText(textToCopy);
    showToast("Requirement copied to clipboard", "success");
  };

  // Safe extraction of analysis components
  const requirementsList =
    analysisResult?.requirements ||
    (Array.isArray(analysisResult) ? analysisResult : analysisResult?.data || []);
  const summary = analysisResult?.summary || {
    total: requirementsList.length,
    high: requirementsList.filter((r) => r.priority === "High").length,
    medium: requirementsList.filter((r) => r.priority === "Medium").length,
    low: requirementsList.filter((r) => r.priority === "Low").length,
    riskCount: analysisResult?.risks?.length || 0,
    clarityScore: 85,
  };
  const risksList = analysisResult?.risks || [];
  const breakdown = analysisResult?.classificationBreakdown || {
    functional: requirementsList.filter((r) => r.classification === "Functional").length,
    nonFunctional: requirementsList.filter((r) => r.classification === "Non-Functional").length,
    technical: requirementsList.filter((r) => r.classification === "Technical").length,
    business: requirementsList.filter((r) => r.classification === "Business").length,
  };
  const recommendationsList = analysisResult?.recommendations || [];

  return (
    <div className="app-layout">
      {/* 1. Left Sidebar */}
      <Sidebar
        history={historyList}
        activeId={activeHistoryId}
        isLoadingHistory={isLoadingHistory}
        isOpenMobile={isMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSelectHistory={handleSelectHistory}
        onNewAnalysis={handleNewAnalysis}
        onRequestRename={(item) => setRecordToRename(item)}
        onRequestDelete={(item) => setRecordToDelete(item)}
      />

      {/* 2. Main Workspace */}
      <main className="main-content-area">
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
          onExportJson={handleExportJson}
          onPrintReport={handlePrintReport}
          onCopyMarkdown={handleCopyMarkdown}
          hasResults={requirementsList.length > 0}
          isAnalyzing={isAnalyzing}
        />

        <div className="workspace-container">
          {/* Active Analysis Banner if viewing history */}
          {activeHistoryId && analysisResult?.title && (
            <div className="active-record-banner">
              <span className="banner-tag">History Record</span>
              <span className="banner-title">{analysisResult.title}</span>
              <button
                type="button"
                className="banner-close-btn"
                onClick={handleNewAnalysis}
                title="Exit history view and start new"
              >
                + New Analysis
              </button>
            </div>
          )}

          {/* Requirements Input Area */}
          <RequirementInput
            text={text}
            onChangeText={setText}
            onAnalyze={handleAnalyze}
            onClear={handleClearInput}
            isAnalyzing={isAnalyzing}
            error={error}
          />

          {/* Analysis Results Dashboard */}
          {requirementsList.length > 0 && (
            <div className="results-dashboard-wrap" id="printable-results">
              {/* Overview Metrics Cards */}
              <OverviewCards summary={summary} risksCount={risksList.length} />

              {/* Navigation Tabs */}
              <div className="dashboard-tabs-bar">
                <button
                  type="button"
                  className={`dash-tab-btn ${activeTab === "requirements" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("requirements")}
                >
                  Prioritized Requirements ({requirementsList.length})
                </button>
                <button
                  type="button"
                  className={`dash-tab-btn ${activeTab === "risks" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("risks")}
                >
                  Risks & Ambiguities ({risksList.length})
                </button>
                <button
                  type="button"
                  className={`dash-tab-btn ${activeTab === "classification" ? "tab-active" : ""}`}
                  onClick={() => setActiveTab("classification")}
                >
                  Classification & Taxonomy
                </button>
                {recommendationsList.length > 0 && (
                  <button
                    type="button"
                    className={`dash-tab-btn ${activeTab === "recommendations" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("recommendations")}
                  >
                    Actionable Roadmap ({recommendationsList.length})
                  </button>
                )}
              </div>

              {/* Tab Contents */}
              <div className="dashboard-tab-content">
                {activeTab === "requirements" && (
                  <RequirementsList
                    requirements={requirementsList}
                    onOpenAcceptanceCriteria={(item) => setSelectedCriteriaItem(item)}
                    onCopyItem={handleCopyItem}
                  />
                )}

                {activeTab === "risks" && <RiskAnalysis risks={risksList} />}

                {activeTab === "classification" && (
                  <ClassificationBreakdown
                    classificationBreakdown={breakdown}
                    requirements={requirementsList}
                  />
                )}

                {activeTab === "recommendations" && (
                  <Recommendations recommendations={recommendationsList} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {/* 1. Acceptance Criteria Modal */}
      <AcceptanceCriteriaModal
        isOpen={Boolean(selectedCriteriaItem)}
        requirementItem={selectedCriteriaItem}
        onClose={() => setSelectedCriteriaItem(null)}
        onCopyText={(txt, msg) => {
          navigator.clipboard.writeText(txt);
          showToast(msg || "Criteria copied to clipboard", "success");
        }}
      />

      {/* 2. Version Diff & Compare Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        currentText={text}
        history={historyList}
        onClose={() => setIsCompareOpen(false)}
        onApplyNewText={(newTxt) => {
          setText(newTxt);
          setIsCompareOpen(false);
          showToast("Applied revision into workspace", "info");
        }}
      />

      {/* 3. Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(recordToDelete)}
        title="Delete Analysis Record?"
        message={`Are you sure you want to delete "${recordToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Record"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRecordToDelete(null)}
      />

      {/* 4. Clear Workspace Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Clear Workspace?"
        message="Are you sure you want to clear the requirements textarea? Unsaved changes will be discarded."
        confirmText="Clear Content"
        isDanger={false}
        onConfirm={() => {
          setText("");
          setIsClearConfirmOpen(false);
        }}
        onCancel={() => setIsClearConfirmOpen(false)}
      />

      {/* 5. Rename Modal */}
      <RenameModal
        isOpen={Boolean(recordToRename)}
        initialTitle={recordToRename?.title}
        onSave={handleSaveRename}
        onCancel={() => setRecordToRename(null)}
      />

      {/* 6. Floating Notification Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />
    </div>
  );
}

export default App;