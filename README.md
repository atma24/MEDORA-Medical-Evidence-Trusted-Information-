⚕️ MEDORA (Medical Evidence & Trusted Information)

"From Claims to Evidence. Building a Trusted Web Ecosystem for Health Information."

MEDORA is an innovative web-based fact-checking platform that integrates Machine Learning with a Human-in-the-Loop approach to combat the spread of medical misinformation and health hoaxes. Built for the SwitchFest 2026 competition under the theme "NextGen Secure: Building the Future of Trusted Web Ecosystems".

📖 About the Project

In today's digital era, the public is highly vulnerable to false medical claims. MEDORA bridges the gap between laypeople seeking factual truth and medical practitioners acting as validators.

The system automates the extraction of claims and searches for scientific literature from global repositories (like PubMed). However, to ensure absolute accuracy, the final validation is performed by verified medical professionals. This ecosystem guarantees a safe, clean, and trusted digital space for health information.

🛠️ Tech Stack

MEDORA is built using a modern, scalable architecture, dividing the web framework and the AI processing into dedicated services:

🌐 Frontend & Backend (Web Core)

Framework: Laravel (PHP) - Handling routing, robust backend logic, and Role-Based Access Control.

Styling: Tailwind CSS - For a clean, modern, and responsive user interface.

JavaScript: Vanilla JS / Alpine.js - For interactive UI elements and dynamic modals.

🧠 Artificial Intelligence (NLP Engine)

Language: Python 3.x

Framework: Flask / FastAPI - Serving as an independent microservice API for claim analysis.

Models: Hugging Face Transformers - Used for NLP text extraction (Subject, Relation, Object) and relevance scoring (ml_confidence).

🗄️ Database & Infrastructure

Database: MySQL - Relational database with 17 highly optimized tables for fast queries and data integrity.

Version Control: Git & GitHub

✨ Key Features

MEDORA uses a Role-Based Access Control (RBAC) system with three main user types:

👤 1. User (Public)

Submit Claims: Users can input doubtful health claims or viral news.

Track Verification: Real-time tracking of claim status (Pending Review, Verified).

Detailed Transparency: View the exact literature used and the doctor's final explanation.

Security: 2FA authentication and profile management.

🩺 2. Reviewer (Medical Experts)

Credential Verification: Must register using a valid Medical Registration Number (STR/SIP) verified by Admins.

AI-Assisted Workspace: View NLP-extracted entities (Subject, Relation, Object) and an initial Trust Score.

Literature Matching: Evaluate automated journal references (Support, Contradict, Neutral).

Medical Judgment: Provide final verdicts (Fact, Partially True, Hoax) with detailed medical explanations.

🛡️️ 3. Administrator

Central Dashboard: Monitor total claims, pending reviews, and active users.

Reviewer Approval: Manually verify and approve/reject medical expert credentials.

User Management: Handle account statuses and perform hard-deletes if necessary.

⚙️ How It Works (The Workflow)

Input: A user submits a medical claim (e.g., "Garlic cures COVID-19").

AI Extraction & Search: The Python ML microservice breaks down the claim and fetches relevant scientific papers from global databases (e.g., PubMed).

Mapping: The system maps the relationship between the claim and the evidence, generating an initial ml_confidence score in the database.

Expert Review: A verified medical reviewer analyzes the AI's findings on their dashboard and writes a conclusive, easy-to-understand verdict.

Result Publication: The user receives the verified fact, backed by science and expert opinion.

🗄️ Database Architecture

MEDORA is powered by a robust MySQL relational database consisting of 17 interconnected tables. Key tables include:

users: Manages multi-dimensional authentication and roles (ADMIN, REVIEWER, USER).

claims: Stores user submissions and AI NLP extraction results.

evidences: Central repository for scientific literature (PubMed links, DOIs, abstracts).

claim_evidences: Maps the relationship validity between claims and pieces of evidence.

trust_assessments: Records calculated trust scores and final evidence aggregates.

🚀 Getting Started

To run the MEDORA project locally on your machine, follow these steps:

Prerequisites

PHP >= 8.1

Composer

Node.js & NPM

MySQL Server

Python 3.x (For the ML Service)

Installation

Clone the repository

git clone https://github.com/yourusername/medora.git
cd medora


Backend Setup (Laravel)

composer install
cp .env.example .env
php artisan key:generate


Configure Database

Create a MySQL database named db-medora.

Update your .env file with your database credentials.

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db-medora
DB_USERNAME=root
DB_PASSWORD=


Run Migrations & Seeders

php artisan migrate --seed


Frontend Setup (Tailwind/Vite)

npm install
npm run build


Start the Application

php artisan serve


The application will now be running at http://localhost:8000.

🏆 SDGs Alignment

MEDORA directly contributes to the Sustainable Development Goals (SDG 3): Good Health and Well-being, by promoting digital health literacy and protecting the public from the dangers of incorrect self-diagnosis.

© 2026 MEDORA by Nexora Team. All Rights Reserved.
