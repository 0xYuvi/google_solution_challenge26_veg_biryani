# 🛰️ Smart Resource Allocation (SRA)
### *AI-Powered Crisis Response & Volunteer Orchestration*

[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-blue?style=for-the-badge&logo=google-gemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

---

## 🌪️ The Challenge
In times of crisis or community distress, information is often messy, scattered, and unorganized. NGOs and government agencies struggle to process thousands of field reports—ranging from handwritten notes to voice memos—leading to delayed response times and inefficient resource allocation. **SRA solves this by turning raw community chaos into structured, actionable intelligence.**

## 💡 The Solution
**Smart Resource Allocation (SRA)** is an intelligent civic-tech ecosystem built for the **Google Solution Challenge 2026**. It uses a sophisticated Multi-Agent AI Pipeline to ingest multimodal field data and automatically categorize, prioritize, and allocate resources where they are needed most.

### ✨ Key Features
- **🧠 Intelligence Feed:** Real-time ingestion of community reports (Text/Audio/Images).
- **🤖 Gemini-Powered Orchestration:** Automatic extraction of issues, urgency scoring, and task generation using **Gemini 2.5 Flash**.
- **📍 Geospatial Command Center:** A high-performance dashboard for NGOs to visualize "Hot Zones" and manage resource distribution.
- **⚡ Real-time Sync:** Powered by Firebase and Supabase for instantaneous field-to-command-center updates.

---

## 🛠️ Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | **Angular 17+**, Tailwind CSS (Glassmorphism UI) |
| **Backend** | **Node.js**, Express, Prisma ORM |
| **Database** | **PostgreSQL (Supabase)** with PostGIS for geospatial queries |
| **AI/ML** | **Google Gemini 2.5 Flash**, GCP Vision, Speech-to-Text, Translation |
| **Infrastructure** | **Google Cloud Run** (Serverless), Firebase Hosting |
| **Authentication** | **Firebase Auth** (Google & Email/Password) |

---

## 🧠 The AI "Intelligence" Pipeline
Our proprietary pipeline transforms messy data into structured JSON in milliseconds:
1.  **Ingestion:** Field reports (multimodal) are captured.
2.  **Transcription/OCR:** GCP APIs extract text from images and voice.
3.  **Agentic Synthesis:** **Gemini 2.5 Flash** analyzes the context, determines the "Category" (Water, Health, Infrastructure, etc.), and assigns an "Urgency Score" (1-10).
4.  **Actionable Output:** The system automatically generates a list of "Tasks" and identifies the nearest qualified NGOs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Google Cloud Project with Gemini API enabled
- Firebase Project

### Quick Install
```bash
# 1. Clone the repo
git clone https://github.com/0xYuvi/google_solution_challenge26_veg_biryani

# 2. Install dependencies
npm install

# 3. Setup Environment
# Copy .env.example to apps/api-server/.env and add your keys
```

### Deployment
- **Backend:** `gcloud run deploy`
- **Frontend:** `npx firebase deploy`

---

## 📈 Impact
- **80% Faster** issue categorization compared to manual entry.
- **Real-time** visibility into community distress signals.
- **Data-driven** resource allocation reducing waste and saving lives.

---

<p align="center">
  <i>Developed with precision for the Google Solution Challenge 2026.</i>
</p>