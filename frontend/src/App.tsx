import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { BarChart3, Settings2, Sun, Moon, ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Plus, Trash2, Save, ExternalLink, Power } from 'lucide-react'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════
type View = 'dashboard' | 'detail' | 'integraciones'

interface OpSummary {
  id: string; titulo: string; fuente: string; entidad: string
  sector: string; tipo: string; monto_estimado: number; moneda: string
  fecha_limite: string; duracion_meses: number; estado: string
  score: number | null; recomendacion: string | null
}

interface OpDetail {
  id: string; titulo: string; fuente: string; entidad: string
  sector: string; tipo: string; monto_estimado: number; moneda: string
  fecha_limite: string; duracion_meses: number
  descripcion_corta: string; tdr_texto: string; requisitos_clave: string[]
  analisis?: {
    score_final: number; recomendacion: string; justificacion: string
    clasificacion?: { resumen_tdr: string; red_flags: string[]; complejidad: string }
    match_score?: { sector_match: number; capacidad_tecnica: number; viabilidad_operativa: number; potencial_estrategico: number; riesgo_inverso: number; total: number }
  }
}

interface Stats { total: number; analizadas: number; GO: number; REVISAR: number; 'NO-GO': number }

interface Integration {
  id: string
  name: string
  type: 'seace' | 'devaid' | 'bid' | 'bm' | 'usaaid' | 'onu'
  enabled: boolean
  config: {
    apiKey?: string
    endpoint?: string
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
    filters?: {
      sectors?: string[]
      minAmount?: number
      countries?: string[]
    }
  }
  lastSync?: string
  status: 'connected' | 'error' | 'disabled'
}

// ═══════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════

// ── Grupo Macro Logo ──────────────────────────────────────
function GrupoMacroLogo({ height = 30 }: { height?: number }) {
  const w = Math.round(height * (180 / 48))
  return (
    <svg width={w} height={height} viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Grupo Macro">
      <rect x="0" y="2" width="9" height="44" rx="1.5" fill="#2EAD63"/>
      <rect x="13" y="2" width="9" height="44" rx="1.5" fill="#2EAD63"/>
      <rect x="26" y="2" width="9" height="44" rx="1.5" fill="#2EAD63"/>
      <text x="44" y="21" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontWeight="800" fontSize="17" fill="#2EAD63" letterSpacing="2">GRUPO</text>
      <text x="44" y="42" fontFamily="Plus Jakarta Sans, Arial, sans-serif" fontWeight="800" fontSize="17" fill="#2EAD63" letterSpacing="2">MACRO</text>
    </svg>
  )
}

// ── Header Bar ─────────────────────────────────────────────
function HeaderBar({ theme, setTheme, view, setView }: { 
  theme: string; 
  setTheme: (t: string) => void; 
  view: View; 
  setView: (v: View) => void 
}) {
  const NAV = [
    { key: 'dashboard', label: 'Oportunidades', icon: BarChart3 },
    { key: 'integraciones', label: 'Integraciones', icon: Settings2 },
  ]

  return (
    <header style={{ position: 'relative' }}>
      <div style={{ borderBottom: '1px solid var(--border)', height: '64px', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
        <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <GrupoMacroLogo height={28} />
            <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', letterSpacing: '0.04em', color: 'var(--text-sub)' }}>SEIDOR</span>
              <span style={{ color: 'var(--border-hi)', fontSize: '14px' }}>/</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--accent)', fontWeight: 500 }}>S1-GO</span>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '4px', background: 'var(--accent-dim)', border: '1px solid rgba(200,152,64,0.2)', color: 'var(--accent)' }}>Hackathon 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {NAV.map(n => {
              const Icon = n.icon
              const active = view === n.key
              return (
                <button key={n.key} onClick={() => setView(n.key as View)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px',
                    fontSize: '12px', fontFamily: 'var(--font-display)', fontWeight: 500,
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--text)' : 'var(--text-sub)',
                    borderBottom: active ? '2px solid var(--seidor-blue)' : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-sub)' }}
                >
                  <Icon size={14} />
                  {n.label}
                </button>
              )
            })}
            <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }} />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-sub)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
      <div className="header-accent-line" />
    </header>
  )
}

// ── Footer ────────────────────────────────────────────────
const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border-hi), transparent)' }} />
    <div style={{ padding: '16px 32px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>SEIDOR IA Lab · Grupo Macro Perú 2026</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['mauro.hernandez@seidor.com', 'arvinder.ludhiarich@seidor.com'].map(e => (
            <a key={e} href={`mailto:${e}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>{e}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
)

// ── Score Bar ─────────────────────────────────────────────
const ScoreBar = ({ label, value, max }: { label: string; value: number; max: number }) => {
  const percentage = (value / max) * 100
  const color = percentage >= 70 ? 'var(--green)' : percentage >= 40 ? 'var(--yellow)' : 'var(--red)'
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-sub)', marginBottom: '4px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{value}/{max}</span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${percentage}%`, background: color, borderRadius: '3px',
          transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)'
        }} />
      </div>
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, React.CSSProperties> = {
    GO: { background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(46,173,99,0.3)' },
    REVISAR: { background: 'var(--yellow-dim)', color: 'var(--yellow)', border: '1px solid rgba(245,158,11,0.3)' },
    'NO-GO': { background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(240,101,101,0.3)' },
  }
  
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
      ...styles[status]
    }}>
      {status === 'GO' ? '🟢' : status === 'REVISAR' ? '🟡' : '🔴'} {status}
    </span>
  )
}

// ── Helper: Format currency ──────────────────────────────
const fmt = (n: number, cur: string) =>
  new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 0 }).format(n) + ' ' + cur

// ═══════════════════════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState<View>('dashboard')
  const [ops, setOps] = useState<OpSummary[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [selected, setSelected] = useState<OpDetail | null>(null)
  const [filterRec, setFilterRec] = useState<string>('todos')
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [batchRunning, setBatchRunning] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Fetch opportunities
  const fetchOps = async () => {
    const res = await fetch('/api/oportunidades')
    const data = await res.json()
    setOps(data.oportunidades)
    setStats(data.stats)
  }

  useEffect(() => { fetchOps() }, [])

  // Actions
  const openDetail = async (id: string) => {
    const res = await fetch(`/api/oportunidades/${id}`)
    const data = await res.json()
    setSelected(data)
    setView('detail')
  }

  const analizar = async (id: string) => {
    setAnalyzing(id)
    try {
      const res = await fetch(`/api/oportunidades/${id}/analizar`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      toast.success(`Score: ${data.analisis.score_final}/100 — ${data.analisis.recomendacion}`)
      fetchOps()
      if (selected?.id === id) {
        const detailRes = await fetch(`/api/oportunidades/${id}`)
        setSelected(await detailRes.json())
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setAnalyzing(null)
    }
  }

  const batchAnalizar = async () => {
    setBatchRunning(true)
    try {
      const res = await fetch('/api/oportunidades/batch-analizar', { method: 'POST' })
      const data = await res.json()
      toast.success(`${data.procesadas} oportunidades analizadas`)
      fetchOps()
    } catch {
      toast.error('Error en análisis batch')
    } finally {
      setBatchRunning(false)
    }
  }

  const filtered = ops.filter(op =>
    filterRec === 'todos' ? true :
    filterRec === 'pendiente' ? !op.recomendacion :
    op.recomendacion === filterRec
  )

  // ═════════════════════════════════════════════════════════
  // Views
  // ═════════════════════════════════════════════════════════

  // ── Dashboard View ─────────────────────────────────────
  const DashboardView = () => (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total', val: stats.total, color: 'var(--text)' },
            { label: 'Analizadas', val: stats.analizadas, color: 'var(--text)' },
            { label: 'GO', val: stats.GO, color: 'var(--green)' },
            { label: 'REVISAR', val: stats.REVISAR, color: 'var(--yellow)' },
            { label: 'NO-GO', val: stats['NO-GO'], color: 'var(--red)' },
          ].map((s, i) => (
            <div key={s.label} className="glass-card" style={{ 
              padding: '20px', textAlign: 'center',
              animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both`,
              animationDelay: `${i * 0.05}s`
            }}>
              <p style={{ fontSize: '28px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['todos', 'pendiente', 'GO', 'REVISAR', 'NO-GO'].map(f => (
            <button
              key={f}
              onClick={() => setFilterRec(f)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
                fontFamily: 'var(--font-display)', fontWeight: 500, border: '1px solid',
                cursor: 'pointer', transition: 'all 0.2s',
                background: filterRec === f ? 'var(--seidor-blue)' : 'transparent',
                borderColor: filterRec === f ? 'var(--seidor-blue)' : 'var(--border)',
                color: filterRec === f ? '#fff' : 'var(--text-sub)',
              }}
            >
              {f === 'todos' ? 'Todas' : f}
            </button>
          ))}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} oportunidades</span>
        </div>
        <button
          onClick={batchAnalizar}
          disabled={batchRunning}
          className="btn-seidor"
          style={{ opacity: batchRunning ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {batchRunning ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {batchRunning ? 'Analizando...' : 'Analizar todas'}
        </button>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)' }}>
              {['Oportunidad', 'Fuente', 'Monto', 'Límite', 'Score', 'Decisión', ''].map((h, i) => (
                <th key={h} style={{
                  padding: '14px 20px', textAlign: i >= 4 ? 'center' : 'left',
                  fontSize: '11px', fontWeight: 600, color: 'var(--text-sub)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  borderBottom: '1px solid var(--border)'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((op, i) => (
              <tr key={op.id} style={{
                transition: 'background 0.2s',
              }}>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '13px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.titulo}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{op.sector} · {op.tipo}</p>
                </td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{
                    fontSize: '10px', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '20px',
                    border: '1px solid var(--border)', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)'
                  }}>{op.fuente}</span>
                </td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 500, color: 'var(--text)' }}>{fmt(op.monto_estimado, op.moneda)}</td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-sub)', fontFamily: 'var(--font-mono)' }}>{op.fecha_limite}</td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                  {op.score !== null ? (
                    <span style={{
                      fontSize: '20px', fontWeight: 800,
                      color: op.score >= 70 ? 'var(--green)' : op.score >= 40 ? 'var(--yellow)' : 'var(--red)'
                    }}>{op.score}</span>
                  ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                  {op.recomendacion ? (
                    <StatusBadge status={op.recomendacion} />
                  ) : (
                    <button
                      onClick={() => analizar(op.id)}
                      disabled={analyzing === op.id}
                      className="btn-seidor"
                      style={{ padding: '6px 12px', fontSize: '11px', opacity: analyzing === op.id ? 0.5 : 1 }}
                    >
                      {analyzing === op.id ? <Loader2 size={12} className="animate-spin" /> : '✨ Analizar'}
                    </button>
                  )}
                </td>
                <td style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                  <button
                    onClick={() => openDetail(op.id)}
                    style={{
                      fontSize: '12px', color: 'var(--seidor-blue-light)', background: 'none', border: 'none', cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >Ver →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Detail View ─────────────────────────────────────────
  const DetailView = () => {
    if (!selected) return null
    const a = selected.analisis
    
    return (
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-sub)'}
          ><ArrowLeft size={14} /> Volver</button>
        </div>

        {/* Header Info */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{selected.fuente} · {selected.entidad}</p>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>{selected.titulo}</h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '11px', background: 'var(--accent-dim)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '4px' }}>{selected.sector}</span>
                <span style={{ fontSize: '11px', background: 'var(--bg-elevated)', color: 'var(--text-sub)', padding: '4px 10px', borderRadius: '4px' }}>{selected.tipo}</span>
              </div>
            </div>
            {a && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 800, color: a.score_final >= 70 ? 'var(--green)' : a.score_final >= 40 ? 'var(--yellow)' : 'var(--red)' }}>
                  {a.score_final}
                </div>
                <StatusBadge status={a.recomendacion} />
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            ['Monto estimado', fmt(selected.monto_estimado, selected.moneda)],
            ['Fecha límite', selected.fecha_limite],
            ['Duración', `${selected.duracion_meses} meses`],
            ['Publicación', selected.fecha_limite],
          ].map(([label, val]) => (
            <div key={label} className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>Descripción del Término de Referencia</h3>
          {a?.clasificacion?.resumen_tdr && (
            <div style={{ background: 'var(--seidor-glow)', border: '1px solid var(--seidor-blue)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--seidor-blue-light)', fontWeight: 600, marginBottom: '4px' }}>🤖 Resumen generado por IA</p>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>{a.clasificacion.resumen_tdr}</p>
            </div>
          )}
          <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>{selected.descripcion_corta}</p>
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>Requisitos clave:</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selected.requisitos_clave.map((r, i) => (
                <li key={i} style={{ fontSize: '13px', color: 'var(--text-sub)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--accent)' }}>•</span>{r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Analysis */}
        {a ? (
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '20px' }}>Análisis de Fit con Macroconsult</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <ScoreBar label="Sector match (experiencia en el sector)" value={a.match_score?.sector_match ?? 0} max={25} />
              <ScoreBar label="Capacidad técnica (competencias requeridas)" value={a.match_score?.capacidad_tecnica ?? 0} max={25} />
              <ScoreBar label="Viabilidad operativa (plazos y alcance)" value={a.match_score?.viabilidad_operativa ?? 0} max={20} />
              <ScoreBar label="Potencial estratégico (monto y cliente)" value={a.match_score?.potencial_estrategico ?? 0} max={20} />
              <ScoreBar label="Riesgo (requisitos críticos)" value={a.match_score?.riesgo_inverso ?? 0} max={10} />
            </div>
            {a.clasificacion?.red_flags && a.clasificacion.red_flags.length > 0 && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(240,101,101,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={14} /> Red flags detectados
                </p>
                {a.clasificacion.red_flags.map((f, i) => (
                  <p key={i} style={{ fontSize: '12px', color: 'var(--red)', marginLeft: '20px' }}>• {f}</p>
                ))}
              </div>
            )}
            <div style={{ background: a.recomendacion === 'GO' ? 'var(--green-dim)' : a.recomendacion === 'REVISAR' ? 'var(--yellow-dim)' : 'var(--red-dim)', border: `1px solid ${a.recomendacion === 'GO' ? 'rgba(46,173,99,0.3)' : a.recomendacion === 'REVISAR' ? 'rgba(245,158,11,0.3)' : 'rgba(240,101,101,0.3)'}`, borderRadius: '12px', padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: a.recomendacion === 'GO' ? 'var(--green)' : a.recomendacion === 'REVISAR' ? 'var(--yellow)' : 'var(--red)', marginBottom: '8px' }}>
                {a.recomendacion === 'GO' ? '🟢 Recomendación: GO' : a.recomendacion === 'REVISAR' ? '🟡 Recomendación: REVISAR' : '🔴 Recomendación: NO-GO'}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-sub)', lineHeight: 1.7 }}>{a.justificacion}</p>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Esta oportunidad aún no ha sido analizada por el motor de IA.</p>
            <button
              onClick={() => analizar(selected.id)}
              disabled={analyzing === selected.id}
              className="btn-primary"
              style={{ opacity: analyzing === selected.id ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
            >
              {analyzing === selected.id ? <Loader2 size={16} className="animate-spin" /> : '✨'}
              {analyzing === selected.id ? 'Analizando con IA...' : 'Analizar oportunidad'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Integraciones View ──────────────────────────────────
  const IntegracionesView = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([
      {
        id: '1',
        name: 'SEACE Perú',
        type: 'seace',
        enabled: true,
        config: {
          frequency: 'daily',
          filters: { sectors: ['economía', 'finanzas'], minAmount: 50000, countries: ['Perú'] }
        },
        lastSync: '2026-04-11T14:30:00Z',
        status: 'connected'
      },
      {
        id: '2',
        name: 'DevAID',
        type: 'devaid',
        enabled: true,
        config: {
          frequency: 'daily',
          filters: { sectors: ['tecnología', 'innovación'], minAmount: 100000 }
        },
        lastSync: '2026-04-11T10:15:00Z',
        status: 'connected'
      },
      {
        id: '3',
        name: 'BID - Banco Interamericano',
        type: 'bid',
        enabled: false,
        config: {
          frequency: 'weekly',
          filters: { minAmount: 200000 }
        },
        status: 'disabled'
      },
      {
        id: '4',
        name: 'Banco Mundial',
        type: 'bm',
        enabled: false,
        config: {
          frequency: 'weekly'
        },
        status: 'disabled'
      },
    ])

    const toggleIntegration = (id: string) => {
      setIntegrations(prev => prev.map(int => 
        int.id === id ? { ...int, enabled: !int.enabled, status: !int.enabled ? 'connected' : 'disabled' } : int
      ))
      toast.success('Estado de integración actualizado')
    }

    const saveConfig = () => {
      toast.success('Configuración guardada')
    }

    const statusIcons = {
      connected: <CheckCircle2 size={14} style={{ color: 'var(--green)' }} />,
      error: <XCircle size={14} style={{ color: 'var(--red)' }} />,
      disabled: <Power size={14} style={{ color: 'var(--text-muted)' }} />,
    }

    const statusLabels = {
      connected: 'Conectado',
      error: 'Error',
      disabled: 'Deshabilitado',
    }

    return (
      <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Panel de Integraciones</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Gestiona las fuentes de oportunidades de licitación</p>
          </div>
          <button onClick={saveConfig} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={14} /> Guardar cambios
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {integrations.map((int, i) => (
            <div key={int.id} className="glass-card" style={{ 
              padding: '24px',
              animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both`,
              animationDelay: `${i * 0.05}s`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: int.enabled ? 'var(--seidor-blue)' : 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ExternalLink size={18} color={int.enabled ? '#fff' : 'var(--text-muted)'} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{int.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {statusIcons[int.status]}
                      <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{statusLabels[int.status]}</span>
                      {int.lastSync && int.enabled && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· Última sincronización: {new Date(int.lastSync).toLocaleString('es-PE')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleIntegration(int.id)}
                  style={{
                    width: '48px', height: '28px', borderRadius: '14px',
                    background: int.enabled ? 'var(--green)' : 'var(--border)',
                    border: 'none', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute', top: '3px',
                    left: int.enabled ? '23px' : '3px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>

              {int.enabled && (
                <div style={{ 
                  borderTop: '1px solid var(--border)', 
                  paddingTop: '16px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Frecuencia de sincronización</label>
                    <select 
                      value={int.config.frequency}
                      onChange={(e) => setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, config: { ...i.config, frequency: e.target.value as any } } : i))}
                      className="input-dark"
                      style={{ width: '100%', fontSize: '13px' }}
                    >
                      <option value="realtime">Tiempo real (Webhook)</option>
                      <option value="hourly">Cada hora</option>
                      <option value="daily">Diaria</option>
                      <option value="weekly">Semanal</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Monto mínimo (USD)</label>
                    <input 
                      type="number"
                      value={int.config.filters?.minAmount || ''}
                      onChange={(e) => setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, config: { ...i.config, filters: { ...i.config.filters, minAmount: Number(e.target.value) } } } : i))}
                      className="input-dark"
                      style={{ width: '100%', fontSize: '13px' }}
                      placeholder="Sin mínimo"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'block' }}>Sectores (opcional)</label>
                    <input 
                      type="text"
                      value={int.config.filters?.sectors?.join(', ') || ''}
                      onChange={(e) => setIntegrations(prev => prev.map(i => i.id === int.id ? { ...i, config: { ...i.config, filters: { ...i.config.filters, sectors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } } } : i))}
                      className="input-dark"
                      style={{ width: '100%', fontSize: '13px' }}
                      placeholder="economía, finanzas, tecnología..."
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '20px', marginTop: '24px', background: 'var(--accent-soft)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent)' }}>💡 Nota:</strong> Las integraciones con fuentes oficiales (SEACE, BID, BM) requieren credenciales API válidas. 
            Contacta al equipo de SEIDOR IA para obtener las credenciales de producción.
          </p>
        </div>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
          },
        }}
      />
      <HeaderBar theme={theme} setTheme={setTheme} view={view} setView={setView} />
      
      <main style={{ flex: 1 }}>
        {view === 'dashboard' && <DashboardView />}
        {view === 'detail' && <DetailView />}
        {view === 'integraciones' && <IntegracionesView />}
      </main>
      
      <Footer />
    </div>
  )
}
