# AI Requirement Analyzer & Prioritization SaaS Platform

An AI-powered Requirements Engineering and Prioritization SaaS application that transforms raw software specifications into structured, prioritized, and actionable engineering insights using NLP.

## 🚀 Features

- **Prioritized Classification**: Automatically categorizes requirements into High, Medium, and Low priorities with clear engineering justifications and business impact analysis.
- **Risk & Ambiguity Detection**: Scans for subjective terms (*"fast"*, *"intuitive"*, *"scalable"*), passive voice constructions without responsible actors, and untestable criteria.
- **Taxonomy & Taxonomy Breakdown**: Separates Functional, Non-Functional, Technical, and Business requirements with visual progress meters.
- **BDD Acceptance Criteria Generator**: Automatically generates testable Given-When-Then BDD scenarios (Happy Path, Input Validation, Security Enforcement) in Gherkin syntax.
- **Semantic Version Diff**: Compares baseline vs. revised requirements and highlights Added, Removed, and Modified statements.
- **Persistent History System**: Automatically persists every analysis with full search, rename, and delete capabilities.
- **Multi-Format Export**: Export completed reports to JSON, Markdown, or clean PDF print layouts.

---

## 🏗️ Architecture

```
ai-requirement-system/
├── ai-service/          # Python Flask + spaCy NLP Engine (Port 5000)
├── backend/             # Node.js + Express API & File Persistence (Port 3000)
└── frontend/            # React 19 Modern SaaS UI (Port 3001)
```

---

## 🛠️ Prerequisites

- **Node.js** (v18 or newer)
- **Python** (v3.10 or newer)
- **Git**

---

## 📦 Installation & Setup

### 1. AI Service (Python)
```bash
cd ai-service
pip install flask flask-cors spacy
python -m spacy download en_core_web_sm
python app.py
```
*Runs on `http://localhost:5000`*

### 2. Express Backend (Node.js)
```bash
cd ../backend
npm install
node server.js
```
*Runs on `http://localhost:3000`*

### 3. Frontend (React)
```bash
cd ../frontend
npm install
npm start
```
*Runs on `http://localhost:3001`*

---

## 🔗 API Endpoints

- `POST /api/analyze` - Parses and analyzes requirements, generating priorities, risks, and taxonomy.
- `GET /api/history` - Fetches persistent analysis history records.
- `GET /api/history/:id` - Retrieves a complete saved analysis record.
- `PUT /api/history/:id` - Renames an analysis title.
- `DELETE /api/history/:id` - Deletes a history record.
- `POST /api/compare` - Compares two requirement revisions with semantic diffing.
- `POST /api/acceptance-criteria` - Generates BDD Given-When-Then test cases.
- `GET /api/health` - Service health status check.
