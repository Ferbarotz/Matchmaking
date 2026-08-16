import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { githubApi, teamApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/common/Badge'
import {
  Search, Filter, ExternalLink, Users, Plus, RefreshCw,
  GitFork, MessageSquare, Star
} from 'lucide-react'

const LANGUAGES = ['', 'JavaScript', 'Python', 'TypeScript', 'Go', 'Rust', 'Java', 'Ruby', 'PHP', 'C++']
const LABEL_OPTIONS = ['good first issue', 'help wanted', 'beginner friendly']

function getLabelColor(label) {
  const l = label.toLowerCase()
  if (l.includes('good first')) return 'green'
  if (l.includes('help wanted')) return 'yellow'
  if (l.includes('beginner')) return 'purple'
  return 'slate'
}

function IssueCard({ issue, onImport }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imported, setImported] = useState(false)

  const handleImport = async () => {
    if (!user) return
    setLoading(true)
    try {
      await onImport(issue)
      setImported(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-600 transition-colors group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 mb-1 truncate">
            <GitFork size={11} className="inline mr-1" />
            {issue.repo_name}
          </p>
          <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
            {issue.issue_title}
          </h3>
        </div>
        <a
          href={issue.issue_url} target="_blank" rel="noopener noreferrer"
          className="text-slate-500 hover:text-indigo-400 flex-shrink-0 mt-0.5"
        >
          <ExternalLink size={15} />
        </a>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {issue.labels?.map((label) => (
          <Badge key={label} label={label} color={getLabelColor(label)} />
        ))}
        {issue.language && (
          <Badge label={issue.language} color="indigo" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {issue.comments}
          </span>
          {issue.user?.login && (
            <span className="flex items-center gap-1">
              <img
                src={issue.user.avatar_url}
                alt={issue.user.login}
                className="w-4 h-4 rounded-full"
              />
              {issue.user.login}
            </span>
          )}
        </div>

        {user && (
          <button
            onClick={handleImport}
            disabled={loading || imported}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors
              ${imported
                ? 'bg-green-900/40 text-green-400 border border-green-700 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50'}`}
          >
            {imported ? (
              <><Star size={12} />Importada</>
            ) : loading ? 'Importando...' : (
              <><Plus size={12} />Reclutar equipo</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [filters, setFilters] = useState({
    language: '',
    labels: 'good first issue',
    q: '',
  })
  const [draftQ, setDraftQ] = useState('')

  const fetchIssues = useCallback(async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await githubApi.searchIssues({
        ...filters,
        page: currentPage,
        per_page: 20,
      })
      setIssues(data.items || [])
      setTotalCount(data.total_count || 0)
    } catch (err) {
      setError(err.response?.data?.error || 'Error conectando con GitHub')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (!user) return
    fetchIssues(page)
  }, [fetchIssues, page, user])

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(f => ({ ...f, q: draftQ }))
    setPage(1)
  }

  const handleImport = async (issue) => {
    try {
      const { data } = await githubApi.importIssue({
        github_issue_id: issue.github_issue_id,
        repo_name: issue.repo_name,
        repo_url: issue.repo_url,
        issue_title: issue.issue_title,
        issue_url: issue.issue_url,
        language: issue.language,
        labels: issue.labels,
        difficulty_level: 'Beginner',
      })
      // Navigate to teams list filtered by this issue
      navigate(`/teams?issue_id=${data.issue.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const totalPages = Math.ceil(Math.min(totalCount, 1000) / 20)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-3">
          Encuentra tu primer <span className="text-indigo-400">issue</span> de Open Source
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Explora issues reales, forma un micro-equipo de 2-3 personas y envía tu primer Pull Request colaborativo.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-slate-400 mb-1">Buscar</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={draftQ}
                onChange={e => setDraftQ(e.target.value)}
                placeholder="e.g. bug fix, documentation..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="min-w-36">
            <label className="block text-xs text-slate-400 mb-1">Lenguaje</label>
            <select
              value={filters.language}
              onChange={e => { setFilters(f => ({ ...f, language: e.target.value })); setPage(1) }}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l || 'Todos'}</option>)}
            </select>
          </div>

          <div className="min-w-44">
            <label className="block text-xs text-slate-400 mb-1">Etiqueta</label>
            <select
              value={filters.labels}
              onChange={e => { setFilters(f => ({ ...f, labels: e.target.value })); setPage(1) }}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {LABEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Search size={14} />Buscar
            </button>
            <button
              type="button"
              onClick={() => fetchIssues(page)}
              disabled={loading}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </form>
      </div>

      {/* Results info */}
      {!loading && totalCount > 0 && (
        <p className="text-slate-500 text-sm mb-4">
          ~{totalCount.toLocaleString()} issues encontradas — mostrando página {page}
        </p>
      )}

      {/* Content */}
      {!user ? (
        <div className="text-center py-20 text-slate-500">
          <Users size={40} className="mx-auto mb-3 text-slate-600" />
          <p>Inicia sesión para explorar issues y crear equipos</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-400 bg-red-900/20 rounded-xl border border-red-800">
          {error}
        </div>
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Filter size={36} className="mx-auto mb-3 text-slate-600" />
          <p>No se encontraron issues con esos filtros.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <IssueCard key={issue.github_issue_id} issue={issue} onImport={handleImport} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
              >
                Anterior
              </button>
              <span className="text-slate-400 text-sm">Página {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
