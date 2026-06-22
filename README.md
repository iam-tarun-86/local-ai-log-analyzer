# 🛡️ Local AI Security Log Analyzer

A high-performance, full-stack SIEM (Security Information and Event Management) automation tool. This system ingests raw server logs or code snippets, orchestrates real-time forensic evaluations using a locally hosted, containerized Large Language Model, and returns structured threat intelligence via a responsive, cyber-themed dashboard.

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **Fully Local Inference** | Zero reliance on costly external cloud APIs. All intelligence runs entirely inside local VRAM via an optimized Docker pipeline. |
| **Batch Log Processing** | Upload entire `.log` or `.txt` files. The backend intelligently chunks logs into groups of 10 lines and processes them in a single prompt, leveraging the model's 128K context window. |
| **Structured JSON Output** | Strict system prompting with regex fallback extraction guarantees clean telemetry. |
| **Deterministic Analysis** | `temperature: 0.0` for repeatable, hallucination-free incident triage. |
| **Cyber-Themed Dashboard** | Real-time animated background with threat nodes, digital rain, radar sweep, and scanning effects. Glassmorphism UI with dark/light mode toggle. |
| **Live Threat Feed** | Sidebar feed showing recent detections with severity-coded badges. |
| **Interactive Charts** | Pie chart for severity distribution and bar chart for threat categories. |
| **Drag & Drop Upload** | Intuitive file drop zone with visual feedback for batch log analysis. |

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
| **Inference Engine** | `llama.cpp` server deployed via Docker |
| **Local Core Intelligence** | Gemma 4 E4B Q5_K_P (~53 tokens/sec, 128K context) |

## 🔧 Prerequisites

- Python 3.10+
- Node.js 18+
- Docker (for llama-server)
- NVIDIA GPU with CUDA support (recommended)
- A quantized GGUF model file (e.g., Gemma 4 E4B Q5_K_P)

## 📦 Installation & Setup

### 1. Start the LLM Server

Ensure your dockerized `llama-server` or local binary is active on port `8080`, exposing OpenAI-compatible `/v1/chat/completions` endpoints.

Example Docker command:
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
pip install flask flask-cors requests
python app.py
```

The Flask API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The React dashboard will be available at `http://localhost:5173`.

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze a single log entry. Accepts JSON: `{"log": "your log string"}` |
| `/api/upload` | POST | Upload a `.log` or `.txt` file for batch analysis. Processes 10 lines per prompt |

### Example Request

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"log": "Jun 9 18:20:01 server sshd[1234]: Failed password for root from 192.168.1.100 port 54322 ssh2"}'
```

### Example Response

```json
{
  "threat_detected": true,
  "severity": "Medium",
  "threat_type": "Brute Force Attempt",
  "affected_ip": "192.168.1.100",
  "timestamp": "Jun 9 18:20:01",
  "mitigation": "Block source IP temporarily and monitor for subsequent attempts.",
  "confidence": "High"
}
```

## 🎯 Usage

1. **Single Log Analysis**: Paste a log entry into the text area and click **Analyze Text**.
2. **Batch File Upload**: Drag and drop a `.log` or `.txt` file onto the drop zone, or click **Browse Files**.
3. **View Results**: Threat cards appear with color-coded severity (High/Medium/Low), IP addresses, and mitigation steps.
4. **Monitor History**: Switch to the **History** tab to view all past analyses.
5. **Toggle Theme**: Click the **Light/Dark Mode** button in the sidebar.

## 🧠 Model Configuration

The backend is configured to work with any OpenAI-compatible local server. To use a different model, update the `MODEL` variable in `backend/app.py`:

```python
MODEL = "your-model-name"
```

## 🏷️ Tech Stack

`react` `vite` `flask` `python` `llama.cpp` `docker` `gemma` `siem` `cybersecurity` `local-llm` `log-analysis`

## 📄 License

MIT License — feel free to use this project for your portfolio, interviews, or production environments.

---

Built with 💻 and ☕ by [Your Name](https://github.com/YOUR_USERNAME)
