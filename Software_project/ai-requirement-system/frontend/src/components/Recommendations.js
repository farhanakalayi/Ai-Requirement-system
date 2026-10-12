import React from "react";

export default function Recommendations({ recommendations = [] }) {
  if (recommendations.length === 0) return null;

  return (
    <div className="requirements-section-card">
      <div className="section-card-header">
        <div>
          <h3 className="section-title">Actionable Engineering Recommendations</h3>
          <p className="section-subtitle">
            Prioritized roadmap to refine this PRD before architecture planning and sprint estimation
          </p>
        </div>
      </div>

      <div className="recommendations-list">
        {recommendations.map((rec, index) => {
          const isHigh = rec.priority === "High";
          const isMed = rec.priority === "Medium";
          return (
            <div key={index} className="recommendation-item-card">
              <div className="rec-left-badge-col">
                <span className="rec-step-number">{index + 1}</span>
                <span
                  className={`rec-prio-tag ${
                    isHigh ? "rec-prio-high" : isMed ? "rec-prio-med" : "rec-prio-low"
                  }`}
                >
                  {rec.priority}
                </span>
              </div>

              <div className="rec-body-col">
                <h4 className="rec-title">{rec.title}</h4>
                <p className="rec-desc">{rec.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
