import React, { useState, useEffect, useRef } from "react";
import { IconEdit, IconX } from "./Icons";

export default function RenameModal({ isOpen, initialTitle, onSave, onCancel }) {
  const [title, setTitle] = useState(initialTitle || "");
  const inputRef = useRef(null);

  useEffect(() => {
    setTitle(initialTitle || "");
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialTitle]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim());
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true">
      <div className="modal-card modal-card-sm" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <div className="modal-title-row">
              <span className="modal-icon-badge modal-icon-primary">
                <IconEdit size={18} color="#4f46e5" />
              </span>
              <h3 className="modal-title">Rename Analysis</h3>
            </div>
            <button type="button" className="icon-btn-ghost" onClick={onCancel} aria-label="Close dialog">
              <IconX size={16} />
            </button>
          </div>

          <div className="modal-body">
            <label className="input-label" htmlFor="rename-input">
              Analysis Title
            </label>
            <input
              id="rename-input"
              ref={inputRef}
              type="text"
              className="text-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter descriptive title..."
              maxLength={80}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>
              Save Title
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
