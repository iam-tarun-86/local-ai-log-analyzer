import { useState, useEffect, useRef } from 'react'
import {
  Shield, AlertTriangle, CheckCircle, Send, Upload,
  LayoutDashboard, FileText, Settings, Sun, Moon,
  Activity, AlertOctagon, ShieldCheck, BarChart3,
  Radio, Wifi, ShieldAlert, Crosshair
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

// Animated background component
function CyberBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = document.documentElement.scrollWidth
      canvas.height = document.documentElement.scrollHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', resize)

    const nodes = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 3 + 2,
      pulse: Math.random() * Math.PI * 2,
      threat: Math.random() > 0.7,
      connections: []
    }))

    const columns = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      chars: '01',
      charIndex: Math.floor(Math.random() * 20)
    }))

    let radarAngle = 0

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 14, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      nodes.forEach((node, i) => {
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1

        node.pulse += 0.03

        nodes.forEach((other, j) => {
          if (i === j) return
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.3
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = node.threat
              ? `rgba(255, 68, 68, ${alpha})`
              : `rgba(37, 99, 235, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      nodes.forEach(node => {
        const pulseRadius = node.radius + Math.sin(node.pulse) * 2
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, pulseRadius * 4
        )
        if (node.threat) {
          gradient.addColorStop(0, 'rgba(255, 68, 68, 0.4)')
          gradient.addColorStop(1, 'rgba(255, 68, 68, 0)')
        } else {
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)')
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0)')
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseRadius * 4, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.threat ? '#ff4444' : '#2563eb'
        ctx.fill()

        if (node.threat) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, pulseRadius * 2, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 68, 68, ${0.3 + Math.sin(node.pulse) * 0.2})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      ctx.font = '12px monospace'
      columns.forEach(col => {
        col.y += col.speed
        if (col.y > canvas.height) {
          col.y = -20
          col.x = Math.random() * canvas.width
        }

        const char = col.chars[Math.floor(col.charIndex) % col.chars.length]
        col.charIndex += 0.1

        ctx.fillStyle = `rgba(0, 204, 102, ${0.1 + Math.random() * 0.15})`
        ctx.fillText(char, col.x, col.y)
      })

      const radarX = canvas.width * 0.85
      const radarY = canvas.height * 0.15
      const radarRadius = 80

      ctx.beginPath()
      ctx.arc(radarX, radarY, radarRadius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0, 204, 102, 0.2)'
      ctx.lineWidth = 1
      ctx.stroke()

      for (let i = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.arc(radarX, radarY, radarRadius * (i / 3), 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(0, 204, 102, 0.1)'
        ctx.stroke()
      }

      radarAngle += 0.02
      ctx.beginPath()
      ctx.moveTo(radarX, radarY)
      ctx.lineTo(
        radarX + Math.cos(radarAngle) * radarRadius,
        radarY + Math.sin(radarAngle) * radarRadius
      )
      ctx.strokeStyle = 'rgba(0, 204, 102, 0.6)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(radarX, radarY)
      ctx.arc(radarX, radarY, radarRadius, radarAngle - 0.5, radarAngle)
      ctx.closePath()
      ctx.fillStyle = 'rgba(0, 204, 102, 0.1)'
      ctx.fill()

      nodes.filter(n => n.threat).forEach(node => {
        const dx = node.x - radarX
        const dy = node.y - radarY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < radarRadius) {
          ctx.beginPath()
          ctx.arc(radarX + dx * 0.3, radarY + dy * 0.3, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#ff4444'
          ctx.fill()
        }
      })

      const scanY = (Date.now() / 50) % canvas.height
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(canvas.width, scanY)
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)'
      ctx.lineWidth = 1
      ctx.stroke()

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="cyber-bg" />
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [log, setLog] = useState('')
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [agentMode, setAgentMode] = useState(false)

  const analyzeText = async () => {
    if (!log.trim()) return
    setLoading(true)
    setResults([])

    // Pre-load audio context on user click (required by browsers)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    audioCtx.resume()

    const endpoint = agentMode ? 'http://localhost:5000/api/analyze-agent' : 'http://localhost:5000/api/analyze'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log })
      })
      const data = await res.json()
      setResults([data])
      addToHistory(data, log)

      // Play sound if escalated
      if (data.agent_decision === "ESCALATED") {
        const audio = new Audio('/alert.mp3')
        audio.play().catch(() => {
          // Fallback: synthetic beep
          const osc = audioCtx.createOscillator()
          const gain = audioCtx.createGain()
          osc.connect(gain)
          gain.connect(audioCtx.destination)
          osc.frequency.value = 800
          osc.type = 'square'
          gain.gain.value = 0.3
          osc.start()
          setTimeout(() => osc.stop(), 300)
        })
      }
    } catch (err) {
      setResults([{ error: err.message }])
    }
    setLoading(false)
  }

  const analyzeFile = async (file) => {
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
      data.results?.forEach(r => addToHistory(r, 'Batch upload'))
    } catch (err) {
      setResults([{ error: err.message }])
    }
    setLoading(false)
  }

  const addToHistory = (result, source) => {
    setHistory(prev => [{
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      threat: result.threat_type || 'No Threat',
      severity: result.severity || 'Low',
      source: source.slice(0, 50)
    }, ...prev].slice(0, 50))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) analyzeFile(e.dataTransfer.files[0])
  }

  const color = (sev) => {
    if (sev === 'High') return '#ff4444'
    if (sev === 'Medium') return '#ffaa00'
    return '#00cc66'
  }

  const stats = {
    total: history.length,
    threats: history.filter(h => h.severity !== 'Low').length,
    high: history.filter(h => h.severity === 'High').length,
    medium: history.filter(h => h.severity === 'Medium').length
  }

  const pieData = [
    { name: 'High', value: stats.high, color: '#ff4444' },
    { name: 'Medium', value: stats.medium, color: '#ffaa00' },
    { name: 'Low', value: history.filter(h => h.severity === 'Low').length, color: '#00cc66' }
  ].filter(d => d.value > 0)

  const barData = [
    { name: 'SSH', value: history.filter(h => h.threat?.includes('SSH') || h.threat?.includes('Brute')).length },
    { name: 'Web', value: history.filter(h => h.threat?.includes('Web') || h.threat?.includes('Directory')).length },
    { name: 'Other', value: history.filter(h => !h.threat?.includes('SSH') && !h.threat?.includes('Web') && !h.threat?.includes('Directory')).length }
  ]

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <Activity size={24} color="#2563eb" />
          <div>
            <h3>{stats.total}</h3>
            <p>Total Scans</p>
          </div>
        </div>
        <div className="stat-card">
          <AlertOctagon size={24} color="#ff4444" />
          <div>
            <h3>{stats.threats}</h3>
            <p>Threats Found</p>
          </div>
        </div>
        <div className="stat-card">
          <ShieldCheck size={24} color="#00cc66" />
          <div>
            <h3>{stats.high}</h3>
            <p>High Severity</p>
          </div>
        </div>
        <div className="stat-card">
          <BarChart3 size={24} color="#ffaa00" />
          <div>
            <h3>{stats.medium}</h3>
            <p>Medium Severity</p>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <div className="input-box">
            <div className="input-header">
              <Crosshair size={16} />
              <span>Threat Detection Input</span>
            </div>
            <textarea
              value={log}
              onChange={(e) => setLog(e.target.value)}
              placeholder="Paste a log entry here..."
              rows={4}
            />
            <div className="button-row">
              <button onClick={analyzeText} disabled={loading}>
                <Send size={16} /> {loading ? 'Scanning...' : (agentMode ? 'Agent Analyze' : 'Analyze Text')}
              </button>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={agentMode}
                  onChange={(e) => setAgentMode(e.target.checked)}
                />
                <span className="toggle-label">{agentMode ? '🤖 Agent Mode' : '⚡ Simple Mode'}</span>
              </label>
            </div>

            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={32} />
              <p>Drag & drop .log or .txt file here</p>
              <span>or</span>
              <label className="file-btn">
                Browse Files
                <input type="file" accept=".log,.txt" onChange={(e) => analyzeFile(e.target.files[0])} hidden />
              </label>
            </div>
          </div>

          {loading && (
            <div className="scanning-indicator">
              <div className="scan-line"></div>
              <p><Radio size={14} className="pulse" /> Scanning for threats...</p>
            </div>
          )}

          <div className="results">
            {results.map((result, i) => (
              <div key={i} className={`result-card ${result.threat_detected ? 'threat' : 'safe'}`} style={{ borderLeft: `4px solid ${color(result.severity)}` }}>
                <div className="result-header">
                  {result.threat_detected ? <ShieldAlert color={color(result.severity)} size={20} /> : <CheckCircle color="#00cc66" size={20} />}
                  <h3>{result.threat_type || 'No Threat Detected'}</h3>
                  <span className="badge" style={{ background: color(result.severity) }}>{result.severity}</span>
                </div>
                <div className="result-body">
                  <p><strong><Wifi size={14} /> IP:</strong> {result.affected_ip || 'N/A'}</p>
                  <p><strong><Shield size={14} /> Mitigation:</strong> {result.mitigation}</p>
                  <p><strong>Confidence:</strong> {result.confidence}</p>
                </div>
                {result.error && <p className="error-text">Error: {result.error}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <div className="chart-box">
            <h4><Crosshair size={14} /> Threat Severity Distribution</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e0e6ed'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-box">
            <h4><BarChart3 size={14} /> Threat Categories</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#6b7b8e" />
                <YAxis stroke="#6b7b8e" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e0e6ed'
                  }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="threat-feed">
            <h4><Radio size={14} className="pulse" /> Live Threat Feed</h4>
            <div className="feed-list">
              {history.slice(0, 5).map((item, i) => (
                <div key={item.id} className="feed-item" style={{ borderLeft: `3px solid ${color(item.severity)}` }}>
                  <span className="feed-time">{item.time}</span>
                  <span className="feed-threat">{item.threat}</span>
                  <span className="badge" style={{ background: color(item.severity), fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>{item.severity}</span>
                </div>
              ))}
              {history.length === 0 && <p className="empty-feed">No threats detected yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHistory = () => (
    <div className="history-page">
      <div className="history-header-row">
        <h2>Scan History</h2>
        <button className="clear-btn" onClick={() => setHistory([])}>
          Clear History
        </button>
      </div>
      <div className="history-table">
        <div className="history-header">
          <span>Time</span>
          <span>Threat</span>
          <span>Severity</span>
          <span>Source</span>
        </div>
        {history.map((item) => (
          <div key={item.id} className="history-row">
            <span>{item.time}</span>
            <span>{item.threat}</span>
            <span className="badge" style={{ background: color(item.severity) }}>{item.severity}</span>
            <span className="source">{item.source}</span>
          </div>
        ))}
        {history.length === 0 && <p className="empty">No analyses yet. Run a scan to see history.</p>}
      </div>
    </div>
  )

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <CyberBackground />
      <aside className="sidebar">
        <div className="logo">
          <Shield size={28} />
          <span>SIEM AI</span>
        </div>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
            <FileText size={18} /> History
          </button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </aside>

      <main className="content">
        <header>
          <h1>{activeTab === 'dashboard' ? 'Security Dashboard' : activeTab === 'history' ? 'Scan History' : 'Settings'}</h1>
          <div className="status">
            <span className="dot green"></span>
            <span className="pulse-text">Gemma 4 E4B Online</span>
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'settings' && (
          <div className="settings-page">
            <h2>System Configuration</h2>
            <div className="setting-item">
              <span>Model</span>
              <span className="value">Gemma 4 E4B Q5_K_P</span>
            </div>
            <div className="setting-item">
              <span>Context Window</span>
              <span className="value">128K tokens</span>
            </div>
            <div className="setting-item">
              <span>Backend API</span>
              <span className="value">http://localhost:5000</span>
            </div>
            <div className="setting-item">
              <span>LLM Server</span>
              <span className="value">http://localhost:8080</span>
            </div>
            <div className="setting-item">
              <span>Temperature</span>
              <span className="value">0.0 (Deterministic)</span>
            </div>
            <div className="setting-item">
              <span>Batch Size</span>
              <span className="value">10 lines per prompt</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App