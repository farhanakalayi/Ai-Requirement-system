from flask import Flask, request, jsonify
import spacy
import re

try:
    from flask_cors import CORS
except ImportError:
    CORS = None

app = Flask(__name__)
if CORS is not None:
    try:
        CORS(app)
    except Exception:
        pass

nlp = spacy.load("en_core_web_sm")

AMBIGUOUS_TERMS = {
    "fast": "Subjective speed claim. Specify maximum response latency (e.g., '< 500ms under 1000 concurrent users').",
    "quick": "Subjective time claim. Define precise timeout or duration target.",
    "user-friendly": "Subjective UX claim. Define specific usability criteria (e.g., 'task completion within 3 clicks', SUS score > 80).",
    "intuitive": "Untestable usability claim. Specify onboarding completion rate or design system standard.",
    "seamless": "Vague integration claim. Define zero-downtime, SSO, or automated sync constraints.",
    "robust": "Vague resilience claim. Specify uptime SLA (e.g., 99.9% uptime) and failover recovery time (RTO < 5m).",
    "scalable": "Vague growth claim. Specify expected peak throughput (e.g., 'support scaling from 1k to 50k RPS').",
    "efficient": "Untestable efficiency claim. Define CPU/memory resource caps or processing time per batch.",
    "flexible": "Vague architecture claim. Specify supported formats, plugin interfaces, or configuration parameters.",
    "easy": "Subjective difficulty claim. Specify training time or error rate benchmarks.",
    "real-time": "Vague timing claim. State whether this implies WebSocket push, polling interval, or sub-second event delivery (< 250ms).",
    "as soon as possible": "Indefinite timeframe. Specify precise SLA or dispatch queue deadline.",
    "if appropriate": "Underspecified conditional. Clarify exact business rules or decision table criteria.",
    "etc": "Incomplete enumeration. List all explicit options or define an extensible schema."
}

def clean_sentence(raw_text):
    text = raw_text.strip()
    # Strip bullet points and numbering
    text = re.sub(r'^[•\-\*\>]\s*', '', text)
    text = re.sub(r'^(REQ[-\d]+|Requirement\s*\d+|Step\s*\d+|\d+[\.\)])\s*[:\-\.]?\s*', '', text, flags=re.IGNORECASE)
    return text.strip()

def extract_actors_and_actions(sent_doc):
    actors = []
    actions = []
    dependencies = []
    has_passive = False

    for token in sent_doc:
        # Check for passive voice
        if token.dep_ in ("nsubjpass", "auxpass"):
            has_passive = True
        
        # Actors / subjects
        if token.dep_ in ("nsubj", "nsubjpass") and token.pos_ in ("NOUN", "PROPN", "PRON"):
            actors.append(token.text)
            
        # Core verbs
        if token.pos_ == "VERB" and token.dep_ not in ("aux", "auxpass"):
            actions.append(token.lemma_)
            
        # Dependencies / objects
        if token.dep_ in ("dobj", "pobj") and token.pos_ in ("NOUN", "PROPN"):
            if len(token.text) > 3:
                dependencies.append(token.text)

    # Named entities as actors/systems
    for ent in sent_doc.ents:
        if ent.label_ in ("ORG", "PRODUCT", "PERSON", "GPE"):
            if ent.text not in actors:
                actors.append(ent.text)

    return list(dict.fromkeys(actors)), list(dict.fromkeys(actions)), list(dict.fromkeys(dependencies)), has_passive

def generate_acceptance_criteria_for_item(req_text, actors, actions):
    actor = actors[0] if actors else "an authorized user"
    action = actions[0] if actions else "perform the requested action"
    
    return [
        {
            "scenario": "Happy Path Execution",
            "given": f"the system is online and {actor} has valid permissions",
            "when": f"{actor} triggers {action} with valid input parameters",
            "then": "the system processes the request successfully within standard response thresholds and confirms state update"
        },
        {
            "scenario": "Input Validation & Error Handling",
            "given": f"the system is accepting requests from {actor}",
            "when": f"invalid, malformed, or unauthorized data is submitted",
            "then": "the system rejects the operation, returns a descriptive error message, and logs an audit event without data leakage"
        }
    ]

@app.route('/analyze', methods=['POST'])
def analyze():
    body = request.get_json(force=True, silent=True) or {}
    text = body.get('text', '')
    if not text.strip():
        return jsonify({"error": "No requirement text provided"}), 400

    doc = nlp(text)
    requirements = []
    all_risks = []
    
    # Process text line by line or sentence by sentence
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    sentence_candidates = []

    for line in lines:
        line_doc = nlp(line)
        for s in line_doc.sents:
            cleaned = clean_sentence(s.text)
            if len(cleaned) >= 8 and not cleaned.isdigit():
                sentence_candidates.append((cleaned, s))

    # If lines produced no valid sentences, fallback to full doc sentences
    if not sentence_candidates:
        for s in doc.sents:
            cleaned = clean_sentence(s.text)
            if len(cleaned) >= 8 and not cleaned.isdigit():
                sentence_candidates.append((cleaned, s))

    req_index = 1
    total_ambiguity_penalties = 0
    total_passive_penalties = 0
    total_specificity_bonuses = 0

    for sentence_text, sent_doc in sentence_candidates:
        lower = sentence_text.lower()

        # Skip headers / document metadata
        if (
            sentence_text.isdigit() or
            len(sentence_text) < 10 or
            lower in ["system requirements:", "functional requirements:", "project overview:", "table of contents", "scope:"] or
            ("requirements include" in lower and len(sentence_text.split()) < 5)
        ):
            continue

        req_id = f"REQ-{req_index:03d}"
        req_index += 1

        actors, actions, extracted_deps, has_passive = extract_actors_and_actions(sent_doc)

        # 1. PRIORITY DETERMINATION & JUSTIFICATION
        high_indicators = ["must", "required", "mandatory", "critical", "essential", "shall", "crucial", "strictly"]
        med_indicators = ["should", "recommended", "preferred", "expected", "ideally", "important"]
        low_indicators = ["can", "may", "optional", "could", "possible", "nice to have", "consider"]

        if any(w in lower for w in high_indicators):
            priority = "High"
            reason = "Mandatory constraint specified using binding modal keywords (must/shall/critical)."
            business_impact = "High: Essential for core system operation, legal/compliance mandates, or system security."
        elif any(w in lower for w in med_indicators):
            priority = "Medium"
            reason = "Important operational or user experience capability (should/recommended) but not an absolute blocker for initial release."
            business_impact = "Medium: Directly impacts user satisfaction, processing speed, or workflow efficiency."
        elif any(w in lower for w in low_indicators):
            priority = "Low"
            reason = "Discretionary or optional capability (may/can/optional) suitable for post-launch enhancement."
            business_impact = "Low: Cosmetic, supplementary convenience, or future-phase backlog item."
        else:
            # Context-based priority fallback
            if any(w in lower for w in ["secure", "auth", "encrypt", "payment", "hipaa", "gdpr", "loss"]):
                priority = "High"
                reason = "Involves critical security, authentication, or financial data integrity."
                business_impact = "High: Security vulnerabilities or transaction failures carry severe business risk."
            else:
                priority = "Low"
                reason = "No binding requirement keywords detected; treated as general baseline capability."
                business_impact = "Low: Secondary system capability."

        # 2. CATEGORY & CLASSIFICATION
        if any(w in lower for w in ["secure", "security", "authentication", "authorization", "encrypt", "privacy", "hipaa", "gdpr", "password", "token", "oauth", "jwt"]):
            category = "Security"
            classification = "Non-Functional"
        elif any(w in lower for w in ["performance", "load", "speed", "response time", "scalable", "concurrent", "latency", "throughput", "fps", "cache", "memory"]):
            category = "Performance"
            classification = "Non-Functional"
        elif any(w in lower for w in ["ui", "interface", "usability", "user-friendly", "responsive", "accessible", "wcag", "mobile-friendly", "dashboard", "layout"]):
            category = "Usability"
            classification = "Non-Functional"
        elif any(w in lower for w in ["api", "database", "sql", "nosql", "endpoint", "webhook", "kafka", "redis", "rest", "graphql", "microservice", "docker"]):
            category = "Architecture & Integration"
            classification = "Technical"
        elif any(w in lower for w in ["sla", "compliance", "billing", "invoice", "audit", "subscription", "pricing", "policy", "legal", "terms"]):
            category = "Business & Compliance"
            classification = "Business"
        elif any(w in lower for w in ["register", "login", "appointment", "billing", "payment", "patient", "inventory", "upload", "download", "export", "search", "filter", "notify"]):
            category = "Functional Core"
            classification = "Functional"
        else:
            category = "General"
            classification = "Functional"

        # 3. DETECT AMBIGUITY & RISKS
        item_risks = []
        for word, explanation in AMBIGUOUS_TERMS.items():
            if re.search(r'\b' + re.escape(word) + r'\b', lower):
                total_ambiguity_penalties += 5
                risk_item = {
                    "id": f"RSK-{len(all_risks) + 1:03d}",
                    "reqId": req_id,
                    "type": "Ambiguity",
                    "severity": "Moderate",
                    "term": word,
                    "requirement": sentence_text,
                    "description": f"Contains subjective/vague term '{word}' without clear measurable criteria.",
                    "whyItMatters": explanation,
                    "suggestion": f"Replace '{word}' with a quantifiable metric or concrete acceptance test."
                }
                item_risks.append(risk_item)
                all_risks.append(risk_item)

        # Passive voice risk
        if has_passive:
            total_passive_penalties += 6
            risk_item = {
                "id": f"RSK-{len(all_risks) + 1:03d}",
                "reqId": req_id,
                "type": "Missing Actor (Passive Voice)",
                "severity": "Moderate",
                "term": "passive voice",
                "requirement": sentence_text,
                "description": "Sentence is constructed in passive voice without a clearly identified triggering actor.",
                "whyItMatters": "Obscures responsibility. Developers and QA cannot definitively tell which system service or user role initiates this action.",
                "suggestion": f"Restructure in active voice: 'The [Actor/System] shall {actions[0] if actions else 'execute'} ...'"
            }
            item_risks.append(risk_item)
            all_risks.append(risk_item)

        # Missing quantifiable metric for performance / security
        if category in ("Performance", "Security") and not any(char.isdigit() for char in sentence_text):
            risk_item = {
                "id": f"RSK-{len(all_risks) + 1:03d}",
                "reqId": req_id,
                "type": "Missing Quantitative Threshold",
                "severity": "High" if category == "Security" else "Moderate",
                "term": "no metrics",
                "requirement": sentence_text,
                "description": f"This {category.lower()} requirement lacks quantifiable targets (e.g., latency, cipher standard, timeout limit).",
                "whyItMatters": "Cannot be automated in CI/CD performance testing or verified against compliance audits.",
                "suggestion": "Include specific numerical thresholds, standard specifications (e.g. AES-256, TLS 1.3), or target response latencies."
            }
            item_risks.append(risk_item)
            all_risks.append(risk_item)

        if any(char.isdigit() for char in sentence_text):
            total_specificity_bonuses += 4
        if actors:
            total_specificity_bonuses += 2

        # 4. DEPENDENCIES & ACCEPTANCE CRITERIA
        acceptance_criteria = generate_acceptance_criteria_for_item(sentence_text, actors, actions)

        requirements.append({
            "id": req_id,
            "requirement": sentence_text,
            "category": category,
            "classification": classification,
            "priority": priority,
            "reason": reason,
            "businessImpact": business_impact,
            "actors": actors if actors else ["System"],
            "dependencies": extracted_deps[:4] if extracted_deps else ["Core Database"],
            "risks": item_risks,
            "acceptanceCriteria": acceptance_criteria
        })

    # Summary calculations
    total_reqs = len(requirements)
    high_count = sum(1 for r in requirements if r["priority"] == "High")
    med_count = sum(1 for r in requirements if r["priority"] == "Medium")
    low_count = sum(1 for r in requirements if r["priority"] == "Low")

    functional_count = sum(1 for r in requirements if r["classification"] == "Functional")
    non_functional_count = sum(1 for r in requirements if r["classification"] == "Non-Functional")
    technical_count = sum(1 for r in requirements if r["classification"] == "Technical")
    business_count = sum(1 for r in requirements if r["classification"] == "Business")

    # Requirement Clarity Score calculation (0-100)
    base_score = 92
    score = base_score - (total_ambiguity_penalties * 0.8) - (total_passive_penalties * 0.8) + (total_specificity_bonuses * 0.5)
    clarity_score = int(max(25, min(98, round(score))))

    # Actionable Recommendations
    recommendations = []
    if all_risks:
        ambiguity_count = sum(1 for r in all_risks if r["type"] == "Ambiguity")
        passive_count = sum(1 for r in all_risks if "Passive Voice" in r["type"])
        if ambiguity_count > 0:
            recommendations.append({
                "priority": "High",
                "title": f"Quantify {ambiguity_count} Ambiguous Term(s)",
                "description": "Replace subjective adjectives like 'fast' and 'user-friendly' with concrete, measurable KPIs and SLA benchmarks."
            })
        if passive_count > 0:
            recommendations.append({
                "priority": "Medium",
                "title": f"Assign Explicit Actors to {passive_count} Requirement(s)",
                "description": "Convert passive voice statements into explicit subject-verb requirements specifying exact user roles or system microservices."
            })
    
    if not any(r["category"] == "Security" for r in requirements):
        recommendations.append({
            "priority": "High",
            "title": "Define Baseline Security and Data Protection Policies",
            "description": "No explicit security or authentication requirements were identified. Add requirements covering encryption at rest, in transit, and role-based access control."
        })

    if not any(r["category"] == "Performance" for r in requirements):
        recommendations.append({
            "priority": "Medium",
            "title": "Establish Performance and Scalability Budgets",
            "description": "Specify expected concurrent user loads, API response times (e.g. p95 < 300ms), and database query latency bounds."
        })

    recommendations.append({
        "priority": "Low",
        "title": "Formalize Acceptance Criteria in BDD Format",
        "description": "Review the auto-generated Given-When-Then scenarios with QA and product stakeholders to prepare automated test cases."
    })

    response_payload = {
        "success": True,
        "summary": {
            "total": total_reqs,
            "high": high_count,
            "medium": med_count,
            "low": low_count,
            "riskCount": len(all_risks),
            "clarityScore": clarity_score,
            "clarityExplanation": "Calculated based on sentence specificity, active actor attribution, verifiable metrics, and absence of subjective/ambiguous vocabulary."
        },
        "classificationBreakdown": {
            "functional": functional_count,
            "nonFunctional": non_functional_count,
            "technical": technical_count,
            "business": business_count
        },
        "requirements": requirements,
        "risks": all_risks,
        "recommendations": recommendations,
        # Preserve backwards compatibility with legacy frontend expecting array directly:
        "data": requirements
    }

    return jsonify(response_payload)

@app.route('/compare', methods=['POST'])
def compare():
    body = request.get_json(force=True, silent=True) or {}
    old_text = body.get('oldText', '')
    new_text = body.get('newText', '')

    old_doc = nlp(old_text)
    new_doc = nlp(new_text)

    old_sents = [clean_sentence(s.text) for s in old_doc.sents if len(clean_sentence(s.text)) >= 8]
    new_sents = [clean_sentence(s.text) for s in new_doc.sents if len(clean_sentence(s.text)) >= 8]

    added = []
    removed = []
    modified = []
    unchanged = []

    matched_new = set()
    matched_old = set()

    # Exact matches first
    for i, o_sent in enumerate(old_sents):
        for j, n_sent in enumerate(new_sents):
            if j not in matched_new and o_sent.lower() == n_sent.lower():
                unchanged.append({"requirement": n_sent, "type": "unchanged"})
                matched_old.add(i)
                matched_new.add(j)
                break

    # Similar matches (modified)
    for i, o_sent in enumerate(old_sents):
        if i in matched_old:
            continue
        o_words = set(o_sent.lower().split())
        best_match = None
        best_ratio = 0
        best_j = -1

        for j, n_sent in enumerate(new_sents):
            if j in matched_new:
                continue
            n_words = set(n_sent.lower().split())
            intersection = o_words.intersection(n_words)
            union = o_words.union(n_words)
            ratio = len(intersection) / len(union) if union else 0
            if ratio > 0.45 and ratio > best_ratio:
                best_ratio = ratio
                best_match = n_sent
                best_j = j

        if best_match and best_j >= 0:
            modified.append({
                "oldRequirement": o_sent,
                "newRequirement": best_match,
                "similarity": round(best_ratio * 100),
                "type": "modified"
            })
            matched_old.add(i)
            matched_new.add(best_j)

    # Remaining in old are removed
    for i, o_sent in enumerate(old_sents):
        if i not in matched_old:
            removed.append({"requirement": o_sent, "type": "removed"})

    # Remaining in new are added
    for j, n_sent in enumerate(new_sents):
        if j not in matched_new:
            added.append({"requirement": n_sent, "type": "added"})

    return jsonify({
        "summary": {
            "totalOld": len(old_sents),
            "totalNew": len(new_sents),
            "addedCount": len(added),
            "removedCount": len(removed),
            "modifiedCount": len(modified),
            "unchangedCount": len(unchanged)
        },
        "added": added,
        "removed": removed,
        "modified": modified,
        "unchanged": unchanged
    })

@app.route('/acceptance-criteria', methods=['POST'])
def acceptance_criteria():
    body = request.get_json(force=True, silent=True) or {}
    req_text = body.get('requirement', '')
    if not req_text:
        return jsonify({"error": "No requirement provided"}), 400

    doc = nlp(req_text)
    actors, actions, deps, _ = extract_actors_and_actions(doc)
    actor = actors[0] if actors else "User"
    action = actions[0] if actions else "perform action"
    target = deps[0] if deps else "the system"

    scenarios = [
        {
            "title": f"Successful Execution of {action.capitalize()}",
            "type": "Positive / Happy Path",
            "given": f"An authorized {actor} is authenticated and on the appropriate interface",
            "when": f"The {actor} submits a valid request to {action} {target}",
            "then": f"The system validates inputs, successfully updates {target}, and displays a success confirmation within 1 second"
        },
        {
            "title": f"Validation Failure on Malformed Input",
            "type": "Negative / Boundary Validation",
            "given": f"The {actor} is attempting to {action} {target}",
            "when": "Required parameters are omitted or format constraints are violated",
            "then": "The system rejects submission, preserves user input in the form, and highlights specific field validation errors"
        },
        {
            "title": f"Security and Authorization Enforcement",
            "type": "Security / Access Control",
            "given": f"An unauthenticated user or user without permissions attempts to {action} {target}",
            "when": "The endpoint or UI action is invoked",
            "then": "The system denies access with HTTP 401/403, logs a security warning event, and redirects to the authentication challenge"
        }
    ]

    return jsonify({
        "requirement": req_text,
        "scenarios": scenarios
    })

if __name__ == '__main__':
    app.run(port=5000, host='0.0.0.0')