import json
import re
import os
import requests
from langgraph.graph import StateGraph, END
from typing import TypedDict, Literal

LLAMA_URL = "http://localhost:8085/v1/chat/completions"
MODEL = "gemma-4-e4b"

# State definition
class AgentState(TypedDict):
    log: str
    threat_detected: bool
    severity: str
    threat_type: str
    affected_ip: str
    timestamp: str
    mitigation: str
    confidence: str
    agent_decision: str
    action_taken: str

SYSTEM_PROMPT = """You are a SIEM analyzer. Output ONLY raw valid JSON. No thinking, no explanations, no markdown. 
JSON: {"threat_detected":boolean,"severity":"High"|"Medium"|"Low","threat_type":string|null,"affected_ip":string|null,"timestamp":string|null,"mitigation":string,"confidence":"High"|"Medium"|"Low"}"""

def get_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1].replace("json", "").strip()
    match = re.search(r'(\[[\s\S]*\]|\{[\s\S]*\})', text)
    if not match:
        raise json.JSONDecodeError("No valid JSON", text, 0)
    return json.loads(match.group(0))

def call_llm(prompt):
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.0,
        "max_tokens": 512
    }
    r = requests.post(LLAMA_URL, json=payload, timeout=30)
    r.raise_for_status()
    return get_json(r.json()["choices"][0]["message"]["content"])

# ===== NODE 1: INGEST =====
def ingest_node(state: AgentState):
    """Parse raw log and extract basic fields."""
    log = state["log"]
    # Try to extract IP with regex
    ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', log)
    ts_match = re.search(r'\[?(\d{1,2}/\w+/\d{4}:\d{2}:\d{2}:\d{2})\]?', log)
    
    return {
        "affected_ip": ip_match.group(0) if ip_match else None,
        "timestamp": ts_match.group(1) if ts_match else None,
    }

# ===== NODE 2: CLASSIFY =====
def classify_node(state: AgentState):
    """Call LLM to classify the threat."""
    log = state["log"]
    prompt = f"Log: {log}\nJSON:"
    
    try:
        result = call_llm(prompt)
    except Exception as e:
        result = {
            "threat_detected": False,
            "severity": "Low",
            "threat_type": "Parse Error",
            "affected_ip": state.get("affected_ip"),
            "timestamp": state.get("timestamp"),
            "mitigation": f"LLM error: {str(e)}",
            "confidence": "Low"
        }
    
    return {
        "threat_detected": result.get("threat_detected", False),
        "severity": result.get("severity", "Low"),
        "threat_type": result.get("threat_type"),
        "mitigation": result.get("mitigation"),
        "confidence": result.get("confidence", "Low"),
    }

# ===== ROUTER: DECIDE NEXT NODE =====
def router(state: AgentState) -> Literal["escalate", "summarize"]:
    if state["severity"] == "High":
        return "escalate"
    return "summarize"

# ===== NODE 3A: ESCALATE =====
def escalate_node(state: AgentState):
    """Trigger alert for critical threats."""
    # Play system beep
    os.system("paplay /usr/share/sounds/freedesktop/stereo/alarm-clock-elapsed.oga 2>/dev/null || echo -e '\\a'")
    
    # Write to alerts file
    alert = {
        "time": state.get("timestamp", "unknown"),
        "severity": state["severity"],
        "threat": state["threat_type"],
        "ip": state.get("affected_ip"),
        "mitigation": state["mitigation"]
    }
    
    alerts_file = os.path.expanduser("~/local-ai-log-analyzer/backend/alerts.json")
    try:
        with open(alerts_file, "r") as f:
            alerts = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        alerts = []
    
    alerts.append(alert)
    with open(alerts_file, "w") as f:
        json.dump(alerts[-50:], f, indent=2)  # Keep last 50
    
    return {
        "agent_decision": "ESCALATED",
        "action_taken": "CRITICAL ALERT: Threat flagged for immediate review. Alert sound triggered. Logged to alerts.json."
    }

# ===== NODE 3B: SUMMARIZE =====
def summarize_node(state: AgentState):
    """Normal logging for non-critical threats."""
    return {
        "agent_decision": "LOGGED",
        "action_taken": f"Standard logging: {state['threat_type']} detected. No immediate action required."
    }

# ===== BUILD GRAPH =====
def build_agent():
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("ingest", ingest_node)
    workflow.add_node("classify", classify_node)
    workflow.add_node("escalate", escalate_node)
    workflow.add_node("summarize", summarize_node)
    
    # Add edges
    workflow.set_entry_point("ingest")
    workflow.add_edge("ingest", "classify")
    workflow.add_conditional_edges(
        "classify",
        router,
        {
            "escalate": "escalate",
            "summarize": "summarize"
        }
    )
    workflow.add_edge("escalate", END)
    workflow.add_edge("summarize", END)
    
    return workflow.compile()

# Singleton agent
agent = build_agent()

def analyze_with_agent(log_text: str) -> dict:
    """Main entry point for agent analysis."""
    initial_state = AgentState(log=log_text)
    final_state = agent.invoke(initial_state)
    return final_state