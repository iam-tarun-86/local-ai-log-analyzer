# 🛡️ Local AI Security Log Analyzer

A high-performance, full-stack SIEM (Security Information and Event Management) automation tool with **LangGraph agentic intelligence**. This system ingests raw server logs, orchestrates real-time forensic evaluations using a locally hosted LLM, and returns structured threat intelligence via a responsive, cyber-themed dashboard.

**Now with Agent Mode**: Conditional routing, automated escalation, and sound alerts for critical threats.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **Fully Local Inference** | Zero external API costs. All intelligence runs inside local VRAM via Docker. |
| **Agent Mode (NEW)** | LangGraph-powered agent with 3 nodes: Ingest → Classify → Escalate/Summarize based on severity |
| **Conditional Routing** | High severity threats trigger automatic escalation with sound alerts |
| **Batch Log Processing** | Upload `.log`/`.txt` files. Backend chunks 10 lines per prompt using 128K context window |
| **Structured JSON Output** | Strict system prompting with regex fallback extraction |
| **Deterministic Analysis** | `temperature: 0.0` for repeatable, hallucination-free triage |
| **Cyber-Themed Dashboard** | Animated threat nodes, digital rain, radar sweep, glassmorphism UI |
| **Dark/Light Mode** | Toggle between themes |
| **Live Threat Feed** | Real-time sidebar feed with severity-coded badges |
| **Interactive Charts** | Pie chart (severity) + bar chart (categories) via Recharts |

---

## 🤖 Agent Architecture (v2)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Ingest    │────►│   Classify   │────►│   Router    │
│  (parse)    │     │  (LLM call)  │     │ (conditional)│
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                  │
                    ┌─────────────────────────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
    ┌─────────────┐    ┌─────────────┐
    │  Escalate   │    │  Summarize  │
    │ (critical)  │    │  (normal)   │
    │  + sound    │    │   + log     │
    └─────────────┘    └─────────────┘
```

**Agent Nodes:**
- **Ingest**: Extracts IP, timestamp from raw log
- **Classify**: LLM determines severity and threat type
- **Router**: Conditional edge — routes High → Escalate, Medium/Low → Summarize
- **Escalate**: Plays alarm sound, logs to `alerts.json`, flags for immediate review
- **Summarize**: Standard logging, no immediate action

---

## 🛠️ System Architecture

```
┌─────────────────┐      HTTP      ┌─────────────────┐      HTTP      ┌─────────────────┐
│   React Frontend │  ───────────► │   Flask Backend │  ───────────► │  llama-server   │
│   (port 5173)    │               │   (port 5000)   │               │  (port 8080)    │
└─────────────────┘               └─────────────────┘               │   (Docker)      │
                                                                      └─────────────────┘
```

| Layer | Technology |
|-------|-----------|
| **Frontend Client** | React 19 + Vite + Lucide React Icons + Recharts |
| **Orchestration Middleware** | Python 3 + Flask + Flask-CORS |
| **Agent Framework** | LangGraph (StateGraph with conditional edges) |
| **Inference Engine** | `llama.cpp` server deployed via Docker |
| **Local Core Intelligence** | Gemma 4 E4B Q5_K_P (~53 tokens/sec, 128K context) |

---

## 🔧 Prerequisites

- Python 3.10+
- Node.js 18+
- Docker (for llama-server)
- NVIDIA GPU with CUDA support (recommended)
- A quantized GGUF model file (e.g., Gemma 4 E4B Q5_K_P)
- Optional: `alert.mp3` sound file in `frontend/public/` for escalation alerts

---

## 📦 Installation & Setup

### 1. Start the LLM Server

```bash
docker run --rm -it \
  --gpus all \
  --cap-add=IPC_LOCK \
  -p 8080:8080 \
  -v ~/llama-models:/models \
  ghcr.io/ggerganov/llama.cpp:server \
  -m /models/your-model.gguf \
  --ctx-size 128000 \
  -ngl 999
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors requests langgraph
python app.py
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | **Simple Mode**: Direct LLM analysis. Returns JSON. |
| `/api/analyze-agent` | POST | **Agent Mode**: LangGraph workflow with conditional routing. Returns JSON + `agent_decision`. |
| `/api/upload` | POST | Batch file upload. Processes 10 lines per prompt. |

### Simple Mode Example

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"log": "Failed password for root from 192.168.1.100"}'
```

### Agent Mode Example

```bash
curl -X POST http://localhost:5000/api/analyze-agent \
  -H "Content-Type: application/json" \
  -d '{"log": "CRITICAL: 50 failed root logins in 60 seconds"}'
```

**Agent Response:**
```json
{
  "threat_detected": true,
  "severity": "High",
  "threat_type": "Brute Force Attack",
  "agent_decision": "ESCALATED",
  "action_taken": "CRITICAL ALERT: Threat flagged for immediate review. Alert sound triggered.",
  "mitigation": "Block IP immediately and enable MFA for root user.",
  "confidence": "High"
}
```

---

## 🎯 Usage

1. **Simple Mode**: Paste log → click **Analyze Text** → get threat assessment
2. **Agent Mode**: Toggle **🤖 Agent Mode** → paste log → click **Agent Analyze**
   - **High severity**: Escalates with alarm sound + logs to `alerts.json`
   - **Medium/Low**: Standard summary, no action required
3. **Batch Upload**: Drag & drop `.log`/`.txt` files for bulk analysis
4. **History**: View all past scans, click **Clear History** to reset
5. **Theme**: Toggle Dark/Light mode in sidebar

---

## 🧠 Model Configuration

Update `MODEL` in `backend/agent.py` or `backend/app.py` to use a different model:

```python
MODEL = "gemma-4-e4b-q5 guff"
```

---

## 🏷️ Tech Stack

`react` `vite` `flask` `python` `langgraph` `llama.cpp` `docker` `gemma` `siem` `cybersecurity` `local-llm` `log-analysis` `agent`

---

## 📄 License

MIT License — feel free to use this project for your portfolio, interviews, or production environments.

---

Built with 💻 and ☕ by TARUN R(https://github.com/iam-tarun-86)
