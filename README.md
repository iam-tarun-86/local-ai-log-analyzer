# 🛡️ Local AI Security Log Analyzer

A high-performance, full-stack SIEM (Security Information and Event Management) automation tool. This system ingests raw server logs or code snippets, orchestrates real-time forensic evaluations using a locally hosted, containerized Large Language Model, and returns structured threat intelligence via a responsive dashboard.

## 🚀 Key Features
* **Fully Local Inference:** Zero reliance on costly external cloud APIs (OpenAI/Anthropic). All intelligence runs entirely inside local VRAM via an optimized Docker pipeline.
* **Structured Telemetry Parsing:** Utilizes strict system prompting and regex extraction layers to guarantee predictable JSON telemetry strings from raw LLM text fields.
* **Deterministic Safety:** Configured at a precise `0.0` temperature index to ensure repeatable, analytical incident triage without behavioral hallucinations.
* **WSL2 Optimized Routing:** Built to natively pass cross-origin requests effortlessly across Windows and Linux kernel network layers.

## 🛠️ System Architecture

* **Frontend Client:** React 19 (Vite) + Lucide Functional Icons
* **Orchestration Middleware:** Python 3 (Flask API Server) + Cross-Origin Resource Sharing (Flask-CORS)
* **Inference Engine:** `llama.cpp` server deployed via specialized Docker multi-threading containers
* **Local Core Intelligence:** Gemma 4 E4B Q5_K_P (Loaded natively into GPU VRAM running at ~53 tokens/second)

---

## 🔧 Installation & Local Environment Setup

### 1. Prerequisites & AI Layer
Ensure your dockerized `llama-server` or local binary instance is active on port `8085` exposing standard OpenAI-compatible `/v1/chat/completions` endpoints. 

### 2. Backend Orchestration Setup
Navigate to the backend microservice workspace, initialize an isolated runtime tracking environment, and deploy the service:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors requests
python3 app.py
