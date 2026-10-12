import React, { useEffect } from "react";
import { IconAlertTriangle, IconX } from "./Icons";

export default function ConfirmModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", isDanger = true, onConfirm, onCancel }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-card modal-card-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className={`modal-icon-badge ${isDanger ? "modal-icon-danger" : "modal-icon-primary"}`}>
              <IconAlertTriangle size={18} color={isDanger ? "#ef4444" : "#4f46e5"} />
            </span>
            <h3 className="modal-title">{title}</h3>
          </div>
          <button className="icon-btn-ghost" onClick={onCancel} aria-label="Close dialog">
            <IconX size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={isDanger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
