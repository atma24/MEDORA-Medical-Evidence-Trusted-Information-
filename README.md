# ⚕ MEDORA (Medical Evidence & Trusted Information)

> **"From Claims to Evidence: Building a Trusted Web Ecosystem for Health Information."**

A smart, responsive web-based medical fact-checking platform that integrates **Artificial Intelligence (NLP)** with a **Human-in-the-Loop** approach to combat the spread of health hoaxes. Built for the **SwitchFest 2026** competition under the theme *"NextGen Secure: Building the Future of Trusted Web Ecosystems"*.

[![SwitchFest 2026](https://img.shields.io/badge/SwitchFest-2026-blue.svg?style=for-the-badge)](#)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](#)
[![HuggingFace](https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](#)

---

## 🌐 Live Demo & Repository
- **Live Application:** [https://app.medorahealth.cloud/](https://app.medorahealth.cloud/)
- **GitHub Repository:** [https://github.com/atma24/MEDORA-Medical-Evidence-Trusted-Information-](https://github.com/atma24/MEDORA-Medical-Evidence-Trusted-Information-)

---

## 📖 Overview

In today's digital era, the public is highly vulnerable to false medical claims and incorrect self-diagnoses. **MEDORA** bridges the gap between laypeople seeking factual truth and medical practitioners acting as validators.

The system automates the extraction of health claims using NLP and searches for scientific literature from global repositories (like PubMed). However, to ensure absolute medical accuracy, the final validation is performed by verified medical professionals. This ecosystem guarantees a safe, clean, and trusted digital space for health information.

---

## 💡 Background (The Problem)

- **Information Overload:** Social media accelerates the spread of unverified health hacks and medical hoaxes.
- **Self-Diagnosis Risks:** Laypeople often misinterpret scientific jargon, leading to dangerous health decisions.
- **Validation Bottleneck:** Medical professionals lack centralized tools to efficiently debunk viral myths with backed scientific evidence.

---

## ✨ Features by Role

MEDORA implements strict Role-Based Access Control (RBAC) with dedicated workspaces for three types of users:

### 👤 1. Public User Workspace
- **Claim Submission:** Interactive form to submit doubtful health claims.
- **Verification Tracking:** Real-time dashboard tracking claim status (*Pending, Validated*).
- **Transparency Details:** View exact literature references (PubMed) and full explanations from medical experts.
- **Account Security:** Profile management, customizable notifications, and Two-Factor Authentication (2FA).

### 🩺 2. Medical Expert (Reviewer) Workspace
- **Credential Validation:** Mandatory Medical Registration Number (STR / SIP) verification during registration.
- **AI-Assisted Dashboard:** View NLP-extracted entities (Subject, Relation, Object) and algorithmic *Trust Scores*.
- **Evidence Mapping:** Analyze automated journal references (Support, Contradict, Neutral).
- **Medical Judgment:** Form to provide final verdicts (Fact, Partially True, Hoax) with detailed clinical explanations.
- **Analytics & Trends:** Track review performance and discover trending health hoaxes.

### 🛡 3. Administrator Workspace
- **Central Dashboard:** Monitor total active users, pending claims, and platform metrics.
- **Reviewer Approval System:** Manually verify and approve/reject medical expert credentials (STR validation).
- **User Management:** Filter roles, manage account statuses, and perform hard-deletes.

---

## 🛠️ Tech Stack

### Web Core (Frontend & Backend)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)

### AI, NLP & Data
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![HuggingFace](https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![Kaggle](https://img.shields.io/badge/Kaggle-20BEFF?style=for-the-badge&logo=Kaggle&logoColor=white)

### Database, Design & Version Control
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## ⚙️ System Workflow

```text
User 
   │
   ▼
Submits Medical Claim (e.g., "Garlic cures COVID")
   │
   ▼
Python AI Microservice (NLP Extraction)
   │ ├── Extracts: Subject, Relation, Object
   │ └── Fetches: PubMed Evidence & Generates Initial Trust Score
   ▼
Claim Status: "Pending Review"
   │
   ▼
Verified Medical Expert (Reviewer)
   │ ├── Reviews AI findings on Dashboard
   │ ├── Validates Evidence (Support/Contradict)
   │ └── Submits Final Medical Verdict
   ▼
Claim Status: "Resolved / Validated"
   │
   ▼
User views Transparent Result & Downloads PDF Report
```

---

## 🏗️ System Architecture

```text
                  [ Web Browser / Mobile ]
                             │
                             ▼
                    [ Next.js Frontend ]
                             │
                             │ REST API
                             ▼
                 [ Laravel Backend Core ] ─────────────┐
                 (Auth, RBAC, API Logic)               │
                             │                         │ REST API
                             ▼                         ▼
  [ MySQL Database ] ────────┘               [ Python AI Engine ]
  (17 Tables: Users,                         (Hugging Face NLP)
   Claims, Evidences)                                  │
                             ┌─────────────────────────┘
                             ▼
                 [ Global Medical Databases ]
                     (PubMed, DOI APIs)
```

---

## 🗄️ Database Structure

The infrastructure is powered by a robust **MySQL** database consisting of 17 interconnected tables. Key tables include:

- `users`: Manages authentication and roles (`ADMIN`, `REVIEWER`, `USER`).
- `claims`: Stores user submissions and AI NLP extraction results (Subject, Relation, Object, `ml_confidence`).
- `evidences`: Central repository for scientific literature (PubMed IDs, DOIs, abstracts, publication years).
- `claim_evidences`: Maps the relationship validity between claims and evidence (`SUPPORT`, `CONTRADICT`, `NEUTRAL`).
- `trust_assessments`: Records calculated trust scores and final evidence aggregates.

---

## 🧑‍💻 Our Contributions

This project was developed collaboratively by the **Nexora Team**, divided into specific technical roles:

### Chesya Kinanti (Front-End & UI/UX Design)
- Conducted user requirement analysis for the medical fact-checking flow.
- Designed the complete User Interface (UI/UX) in Figma (Landing Page, User Dashboard, Reviewer Workspace, Admin Panel).
- Developed the design system (typography, clinical color palette, reusable components).
- Implemented the responsive web client using **Next.js** and React components.

### Abdul Rauf Fansuri (Back-End, Database, & AI Integration)
- Developed the core system API architecture using Laravel 11.
- Designed and managed the MySQL relational database schema (17 tables) to handle complex claim-evidence relationships.
- Implemented strict Role-Based Access Control (RBAC) and credential verification logic.
- Integrated the Python microservice and Hugging Face NLP for automated evidence extraction.

---

## 🏆 SDGs Alignment

MEDORA directly contributes to the **Sustainable Development Goals (SDG 3): Good Health and Well-being**, by promoting digital health literacy, combating medical hoaxes, and protecting the public from the dangers of incorrect self-diagnosis.

---

## 🚀 Future Improvements

- **Automated Credentialing:** Integration with official hospital or government databases for real-time medical professional verification (STR/SIP).
- **Interactive Chatbot:** AI-powered chatbot integration for instant preliminary responses to simple health queries before formal submission.
- **Geospatial Analytics:** A dynamic heatmap feature to track the regional spread and trends of specific health hoaxes based on user submissions.
- **Reviewer Gamification:** Implementing leaderboards and digital badges for medical experts to encourage active participation in validating claims.

---

## 👨‍💻 Developers (Nexora Team)

**Chesya Kinanti**  
*Front-End Developer & UI/UX Designer*
- GitHub: [https://github.com/chesyakinanti](https://github.com/chesyakinanti)

**Abdul Rauf Fansuri**  
*Back-End Developer & AI Integration*
- GitHub: [https://github.com/atma24](https://github.com/atma24)

---
*© 2026 MEDORA by Nexora Team. All Rights Reserved.*
