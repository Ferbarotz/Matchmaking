import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { teamApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/common/Badge'
import {
  ExternalLink, Users, GitPullRequest, CheckSquare, Square,
  ArrowLeft, Github, Code, Send
} from 'lucide-react'

const CHECKLIST_ITEMS = [
  { id: 'fork', label: 'Fork del repositorio realizado' },
  { id: 'branch', label: 'Rama de feature creada (ej. fix/issue-123)' },
  { id: 'local', label: 'Proyecto corriendo localmente' },
  { id: 'issue_read', label: 'Issue leída y comprendida en detalle' },
  { id: 'impl', label: 'Implementación completada' },
  { id: 'tests', label: 'Tests pasando (si aplica)' },
  { id: 'pr_open', label: 'Pull Request abierto en GitHub' },
]

function statusColor(status) {
  const map = { Forming: 'yellow', 'In Progress': 'indigo', 'PR Submitted': 'purple', Merged: 'green' }
  return map[status] || 'slate'
}

export default function TeamSpacePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState({})
  const [prForm, setPrForm] = useState({ pr_url: '', status: 'PR Submitted', pr_status: 'Open' })
  const [submitting, setSubmitting] = useState(false)
  const [statusForm, setStatusForm] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    teamApi.get(id)
      .then(({ data }) => { setTeam(data); setStatusForm(data.status) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const isMember = team?.members?.some(m => m.user_id === user?.id)

  const toggleCheck = (key) =>
    setChecklist(c => ({ ...c, [key]: !c[key] }))

  const checkedCount = Object.values(checklist).filter(Boolean).length

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg('')
    try {
      const payload = { status: statusForm }
      if (prForm.pr_url) {
        payload.pr_url = prForm.pr_url
        payload.pr_status = prForm.pr_status
      }
      const { data } = await teamApi.updateStatus(id, payload)
      setTeam(data)
      setSuccessMsg('Estado actualizado correctamente')
    } catch (err) {
      alert(err.response?.data?.error || 'Error actualizando estado')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-700 rounded w-1/3" />
        <div className="h-40 bg-slate-800 rounded-xl" />
      </div>
    </div>
  )

  if (!team) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500">
      Equipo no encontrado
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/teams" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm">
        <ArrowLeft size={15} />Volver a equipos
      </Link>

      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{team.name}</h1>
              <Badge label={team.status} color={statusColor(team.status)} />
            </div>
            <p className="text-slate-400 text-sm">
              Creado el {new Date(team.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Users size={15} />{team.member_count}/3 miembros
          </div>
        </div>

        {/* Issue info */}
        {team.issue && (
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700">
            <div className="flex items-start gap-3">
              <Code size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-white font-medium">{team.issue.issue_title}</span>
                  <Badge label={team.issue.status} color="slate" />
                </div>
                <p className="text-slate-400 text-sm mb-2">{team.issue.repo_name}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {team.issue.labels?.map(l => (
                    <Badge key={l} label={l} color="green" />
                  ))}
                  {team.issue.language && <Badge label={team.issue.language} color="indigo" />}
                </div>
                <div className="flex gap-3">
                  <a
                    href={team.issue.issue_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    <ExternalLink size={14} />Ver Issue
                  </a>
                  <a
                    href={team.issue.repo_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-300 text-sm"
                  >
                    <Github size={14} />Repositorio
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Members */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users size={16} className="text-indigo-400" />Miembros del Equipo
          </h2>
          {team.members?.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin miembros aún</p>
          ) : (
            <div className="space-y-3">
              {team.members?.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <img
                    src={m.user?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${m.user?.username}`}
                    alt={m.user?.username}
                    className="w-9 h-9 rounded-full border border-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{m.user?.username}</p>
                    <p className="text-slate-400 text-xs">{m.role_in_team}</p>
                  </div>
                  {m.user?.github_username && (
                    <a
                      href={`https://github.com/${m.user.github_username}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-slate-500 hover:text-indigo-400"
                    >
                      <Github size={14} />
                    </a>
                  )}
                  {m.user_id === user?.id && (
                    <span className="text-xs text-indigo-400 bg-indigo-900/40 px-2 py-0.5 rounded-full border border-indigo-700">
                      tú
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* PRs */}
          {team.pull_requests?.length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-700">
              <h3 className="text-slate-300 text-sm font-medium mb-3 flex items-center gap-1.5">
                <GitPullRequest size={14} />Pull Requests
              </h3>
              {team.pull_requests.map(pr => (
                <a
                  key={pr.id}
                  href={pr.pr_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm mb-1.5"
                >
                  <ExternalLink size={12} />
                  <span className="truncate">{pr.pr_url}</span>
                  <Badge label={pr.status} color={pr.status === 'Merged' ? 'green' : 'indigo'} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Checklist & Update */}
        <div className="space-y-4">
          {/* Checklist */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <CheckSquare size={16} className="text-green-400" />Checklist
              </h2>
              <span className="text-xs text-slate-400">{checkedCount}/{CHECKLIST_ITEMS.length}</span>
            </div>
            <div className="space-y-2.5">
              {CHECKLIST_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  {checklist[item.id]
                    ? <CheckSquare size={18} className="text-green-400 flex-shrink-0" />
                    : <Square size={18} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                  }
                  <span className={`text-sm transition-colors ${checklist[item.id] ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            {/* Progress bar */}
            <div className="mt-4 bg-slate-700 rounded-full h-1.5">
              <div
                className="bg-green-500 h-1.5 rounded-full transition-all"
                style={{ width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Update status (members only) */}
          {isMember && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Send size={15} className="text-indigo-400" />Actualizar Estado
              </h2>
              <form onSubmit={handleStatusUpdate} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estado del equipo</label>
                  <select
                    value={statusForm}
                    onChange={e => setStatusForm(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {['Forming', 'In Progress', 'PR Submitted', 'Merged'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">URL del Pull Request</label>
                  <input
                    value={prForm.pr_url}
                    onChange={e => setPrForm({ ...prForm, pr_url: e.target.value })}
                    placeholder="https://github.com/org/repo/pull/42"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {prForm.pr_url && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Estado del PR</label>
                    <select
                      value={prForm.pr_status}
                      onChange={e => setPrForm({ ...prForm, pr_status: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {['Open', 'Closed', 'Merged'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {successMsg && (
                  <p className="text-green-400 text-xs">{successMsg}</p>
                )}

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
