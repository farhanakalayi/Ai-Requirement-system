import React from "react";

export default function ClassificationBreakdown({
  classificationBreakdown = {},
  requirements = [],
}) {
  const total = requirements.length || 1;
  const functional = classificationBreakdown.functional || 0;
  const nonFunctional = classificationBreakdown.nonFunctional || 0;
  const technical = classificationBreakdown.technical || 0;
  const business = classificationBreakdown.business || 0;

  // Category grouping
  const categoryCounts = {};
  requirements.forEach((r) => {
    const cat = r.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categories = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    count: categoryCounts[cat],
    percentage: Math.round((categoryCounts[cat] / total) * 100),
  }));

  return (
    <div className="requirements-section-card">
      <div className="section-card-header">
        <div>
          <h3 className="section-title">Requirement Classification & Distribution</h3>
          <p className="section-subtitle">
            Taxonomy breakdown across Functional, Non-Functional, Technical, and Business dimensions
          </p>
        </div>
      </div>

      <div className="classification-grid">
        {/* Core Dimensions */}
        <div className="classification-col">
          <h4 className="classification-col-title">Engineering Architecture Dimensions</h4>
          <div className="dimension-meters-list">
            {/* Functional */}
            <div className="dimension-meter-item">
              <div className="meter-label-row">
                <span className="meter-name">Functional Requirements</span>
                <span className="meter-value">
                  {functional} ({Math.round((functional / total) * 100)}%)
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className="meter-bar-fill fill-blue"
                  style={{ width: `${(functional / total) * 100}%` }}
                />
              </div>
              <p className="meter-desc">Direct user actions, workflows, data entry, and transactions.</p>
            </div>

            {/* Non-Functional */}
            <div className="dimension-meter-item">
              <div className="meter-label-row">
                <span className="meter-name">Non-Functional Requirements</span>
                <span className="meter-value">
                  {nonFunctional} ({Math.round((nonFunctional / total) * 100)}%)
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className="meter-bar-fill fill-purple"
                  style={{ width: `${(nonFunctional / total) * 100}%` }}
                />
              </div>
              <p className="meter-desc">Performance, security, accessibility, and reliability bounds.</p>
            </div>

            {/* Technical */}
            <div className="dimension-meter-item">
              <div className="meter-label-row">
                <span className="meter-name">Technical / Infrastructure</span>
                <span className="meter-value">
                  {technical} ({Math.round((technical / total) * 100)}%)
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className="meter-bar-fill fill-amber"
                  style={{ width: `${(technical / total) * 100}%` }}
                />
              </div>
              <p className="meter-desc">Databases, API specs, caching layers, and microservices.</p>
            </div>

            {/* Business */}
            <div className="dimension-meter-item">
              <div className="meter-label-row">
                <span className="meter-name">Business & Compliance</span>
                <span className="meter-value">
                  {business} ({Math.round((business / total) * 100)}%)
                </span>
              </div>
              <div className="meter-bar-track">
                <div
                  className="meter-bar-fill fill-green"
                  style={{ width: `${(business / total) * 100}%` }}
                />
              </div>
              <p className="meter-desc">SLAs, regulatory compliance, billing models, and audit policies.</p>
            </div>
          </div>
        </div>

        {/* Domain Categories */}
        <div className="classification-col">
          <h4 className="classification-col-title">Domain Categories Identified</h4>
          <div className="category-chips-list">
            {categories.map((c, idx) => (
              <div key={idx} className="category-chip-card">
                <div className="chip-header">
                  <span className="chip-name">{c.name}</span>
                  <span className="chip-badge">{c.count} items</span>
                </div>
                <div className="chip-progress-track">
                  <div
                    className="chip-progress-fill"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
