import React, { useEffect } from "react";
import { IconCheck, IconAlertTriangle, IconX } from "./Icons";

export default function Toast({ message, type = "info", onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-notification toast-${type}`}
    >
      <div className="toast-icon">
        {isSuccess ? (
          <IconCheck size={16} color="#10b981" />
        ) : isError ? (
          <IconAlertTriangle size={16} color="#ef4444" />
        ) : (
          <span className="toast-dot" />
        )}
      </div>
      <div className="toast-message">{message}</div>
      <button
        onClick={onClose}
        className="toast-close"
        aria-label="Close notification"
      >
        <IconX size={14} color="#64748b" />
      </button>
    </div>
  );
}
