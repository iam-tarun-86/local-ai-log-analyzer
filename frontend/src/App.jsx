import { useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, Send, Upload, XCircle } from 'lucide-react'
import './App.css'

function App() {
  const [log, setLog] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const analyzeText = async () => {
    if (!log.trim()) return
    setLoading(true)
    setResults([])
    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log })
      })
      const data = await res.json()
      setResults([data])
    } catch (err) {
      setResults([{ error: err.message, isSystemError: true }])
    }
    setLoading(false)
  }

  const analyzeFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setResults([])
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setResults([{ error: err.message, isSystemError: true }])
    }
    setLoading(false)
  }

  const color = (sev) => {
    if (sev === 'High') return '#ff4444'
    if (sev === 'Medium') return '#ffaa00'
    return '#00cc66' // Standard Low / System Informational Color
  }

  return (
    <div className="app">
      <h1><Shield size={28} /> Local AI Log Analyzer</h1>
      <p className="subtitle">Gemma 4 E4B • 128K Context • Running Locally</p>

      <div className="input-box">
        <textarea
          value={log}
          onChange={(e) => setLog(e.target.value)}
          placeholder="Paste a log entry here..."
          rows={4}
        />
        <div className="button-row">
          <button onClick={analyzeText} disabled={loading}>
            <Send size={16} /> {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
          <label className="file-btn">
            <Upload size={16} /> Upload .log
            <input type="file" accept=".log,.txt" onChange={analyzeFile} hidden disabled={loading} />
          </label>
        </div>
      </div>

      {loading && <div className="loading">Analyzing with Gemma 4 E4B...</div>}

      <div className="results">
        {results.map((result, i) => {
          // If it's a structural network catch block error, render a standalone custom layout card
          if (result.isSystemError) {
            return (
              <div key={i} className="result system-error-card">
                <div className="result-header">
                  <XCircle color="#ff4444" />
                  <h3>Infrastructure Pipeline Error</h3>
                </div>
                <p className="error-text">{result.error}</p>
              </div>
            )
          }

          return (
            <div key={i} className="result" style={{ borderLeft: `4px solid ${color(result.severity)}` }}>
              <div className="result-header">
                {result.threat_detected ? <AlertTriangle color={color(result.severity)} /> : <CheckCircle color="#00cc66" />}
                <h3>{result.threat_type || 'No Threat Detected'}</h3>
                {/* Only render the visual risk badge if the severity tracking property is present */}
                {result.severity && (
                  <span className="badge" style={{ background: color(result.severity) }}>
                    {result.severity}
                  </span>
                )}
              </div>
              <p><strong>IP:</strong> {result.affected_ip || 'N/A'}</p>
              <p><strong>Mitigation:</strong> {result.mitigation || 'No baseline action required.'}</p>
              <p><strong>Confidence:</strong> {result.confidence || 'High'}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App