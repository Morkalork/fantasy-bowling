'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface ScraperResult {
  success: boolean
  message: string
  matchesProcessed: number
  errors?: string[]
}

interface TeamStats {
  teamId: string
  teamName: string
  divisionId: string
  matchesPlayed: number
  playerAverage: number
  trend: 'up' | 'down' | 'neutral' | null
  uniquePlayers: number
}

export default function Home() {
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<ScraperResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<TeamStats[]>([])
  const [teamsLoading, setTeamsLoading] = useState(true)
  const logRef = useRef<HTMLPreElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  const fetchTeams = useCallback(async () => {
    setTeamsLoading(true)
    try {
      const res = await fetch('/api/teams')
      const data = await res.json()
      setTeams(data.teams ?? [])
    } catch {
      setTeams([])
    } finally {
      setTeamsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const handleScrape = useCallback(() => {
    setLoading(true)
    setLogs([])
    setResult(null)

    const es = new EventSource('/api/scrape')
    eventSourceRef.current = es

    es.addEventListener('log', (e) => {
      setLogs((prev) => [...prev, e.data])
    })

    es.addEventListener('result', (e) => {
      const data: ScraperResult = JSON.parse(e.data)
      setResult(data)
      setLoading(false)
      es.close()
      fetchTeams()
    })

    es.onerror = () => {
      if (!result) {
        setResult({ success: false, message: 'Connection lost', matchesProcessed: 0 })
      }
      setLoading(false)
      es.close()
    }
  }, [result, fetchTeams])

  function renderTrend(trend: 'up' | 'down' | 'neutral' | null) {
    if (trend === null) {
      return null
    }
    if (trend === 'up') {
      return <span style={{ color: '#4caf50', fontSize: '1.2rem' }}>▲</span>
    }
    if (trend === 'down') {
      return <span style={{ color: '#f44336', fontSize: '1.2rem' }}>▼</span>
    }
    return <span style={{ color: '#999', fontSize: '1.2rem' }}>—</span>
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Fantasy Bowling</h1>

      <button onClick={handleScrape} disabled={loading} style={{ marginBottom: '1.5rem' }}>
        {loading ? 'Scraping...' : 'Start Scraping'}
      </button>

      {(logs.length > 0 || loading) && (
        <pre
          ref={logRef}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: '#1a1a2e',
            color: '#e0e0e0',
            borderRadius: '8px',
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '0.85rem',
            lineHeight: '1.5',
          }}
        >
          {logs.join('\n')}
          {loading && '\n▌'}
        </pre>
      )}

      {result && (
        <p style={{ marginTop: '1rem', color: result.success ? '#4caf50' : '#f44336' }}>
          {result.success
            ? `Done! ${result.matchesProcessed} matches processed.`
            : `Error: ${result.message}`}
        </p>
      )}

      <h2 style={{ marginTop: '2rem' }}>Teams</h2>

      {teamsLoading && <p>Loading teams...</p>}

      {!teamsLoading && teams.length === 0 && (
        <p style={{ color: '#999' }}>No match data yet. Run the scraper to get started.</p>
      )}

      {!teamsLoading && teams.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          {teams.map((team) => (
            <a
              key={team.teamId}
              href={`/team/${team.teamId}`}
              style={{
                display: 'block',
                padding: '1.25rem',
                background: '#f5f5f5',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #e0e0e0',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{team.teamName}</h3>
                {renderTrend(team.trend)}
              </div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#555' }}>
                <div>Matches: {team.matchesPlayed}</div>
                <div>Avg Score: {team.playerAverage}</div>
                <div>Players: {team.uniquePlayers}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  )
}
