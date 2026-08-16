import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { teamApi, githubApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/common/Badge'
import { Users, Plus, ExternalLink, Code } from 'lucide-react'
import CreateTeamModal from '../components/common/CreateTeamModal'

function statusColor(status) {
  const map = { Forming: 'yellow', 'In Progress': 'indigo', 'PR Submitted': 'purple', Merged: 'green' }
  return map[status] || 'slate'
}

export default function TeamsPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [teams, setTeams] = useState([])
  const [localIssues, setLocalIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [joining, setJoining] = useState(null)

  const issueIdFilter = searchParams.get('issue_id')

  const load = async () => {
    setLoading(true)
    try {
      const params = issueIdFilter ? { issue_id: issueIdFilter } : {}
      const [teamsRes, issuesRes] = await Promise.all([
        teamApi.list(params),
        githubApi.listLocalIssues(),
      ])
      setTeams(teamsRes.data.teams || teamsRes.data)
      setLocalIssues(issuesRes.data.issues || issuesRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [issueIdFilter])

  const handleJoin = async (teamId) => {
    setJoining(teamId)
    try {
      await teamApi.join(teamId, { role_in_team: user?.role || 'Contributor' })
      await load()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al unirse')
    } finally {
      setJoining(null)
    }
  }

  const isUserMember = (team) =>
    team.members?.some(m => m.user_id === user?.id) ||
    team.memberships?.some(m => m.user_id === user?.id)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Equipos Abiertos</h1>
          {issueIdFilter && (
            <p className="text-slate-400 text-sm mt-1">Filtrando por issue importada</p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />Crear equipo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-500">
          <Users size={36} className="mx-auto mb-3 text-slate-600" />
          <p>No hay equipos abiertos. ¡Crea el primero!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map(team => {
            const isMember = isUserMember(team)
            const isFull = team.member_count >= 3
            return (
              <div
                key={team.id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-white font-semibold">{team.name}</span>
                      <Badge label={team.status} color={statusColor(team.status)} />
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Users size={12} />{team.member_count}/3
                      </span>
                    </div>
                    {team.issue && (
                      <div className="flex items-start gap-2">
                        <Code size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-300 text-sm line-clamp-1">{team.issue.issue_title}</p>
                          <p className="text-slate-500 text-xs">{team.issue.repo_name}</p>
                        </div>
                        <a
                          href={team.issue.issue_url} target="_blank" rel="noopener noreferrer"
                          className="text-slate-500 hover:text-indigo-400 flex-shrink-0"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/teams/${team.id}`}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      Ver
                    </Link>
                    {!isMember && !isFull && (
                      <button
                        onClick={() => handleJoin(team.id)}
                        disabled={joining === team.id}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        {joining === team.id ? '...' : 'Unirse'}
                      </button>
                    )}
                    {isMember && (
                      <span className="px-3 py-1.5 bg-green-900/40 text-green-400 border border-green-700 rounded-lg text-xs">
                        Miembro
                      </span>
                    )}
                    {isFull && !isMember && (
                      <span className="px-3 py-1.5 bg-slate-700 text-slate-500 rounded-lg text-xs">
                        Lleno
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <CreateTeamModal
          issues={localIssues}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load() }}
          defaultIssueId={issueIdFilter}
        />
      )}
    </div>
  )
}
