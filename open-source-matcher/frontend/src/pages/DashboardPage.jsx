import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Badge from '../components/common/Badge'
import {
  Github, Edit3, Save, X, Users, GitPullRequest,
  Star, Trophy, Code
} from 'lucide-react'

const ROLES = ['Frontend', 'Backend', 'Fullstack']
const LEVELS = ['Junior', 'Mid', 'Senior']
const COMMON_SKILLS = ['React', 'Python', 'JavaScript', 'TypeScript', 'Flask', 'Node.js', 'CSS', 'SQL', 'Docker', 'Vue', 'Angular', 'Go', 'Rust']

function statusColor(status) {
  const map = { Forming: 'yellow', 'In Progress': 'indigo', 'PR Submitted': 'purple', Merged: 'green' }
  return map[status] || 'slate'
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [teams, setTeams] = useState([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setForm({
      github_username: user.github_username || '',
      role: user.role || 'Fullstack',
      experience_level: user.experience_level || 'Junior',
      bio: user.bio || '',
      skills: user.skills?.map(s => s.name) || [],
    })
    userApi.myTeams().then(({ data }) => setTeams(data.teams || data)).catch(console.error)
  }, [user])

  const toggleSkill = (skill) =>
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await userApi.updateProfile(form)
      await refreshUser()
      setEditing(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const mergedTeams = teams.filter(t => t.status === 'Merged')
  const activeTeams = teams.filter(t => t.status !== 'Merged')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Equipos activos', value: activeTeams.length, color: 'text-indigo-400' },
          { icon: GitPullRequest, label: 'PRs logrados', value: mergedTeams.length, color: 'text-green-400' },
          { icon: Star, label: 'Skills', value: user?.skills?.length || 0, color: 'text-yellow-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
            <Icon size={24} className={`mx-auto mb-2 ${color}`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Profile card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${user?.username}`}
              alt={user?.username}
              className="w-16 h-16 rounded-full border-2 border-slate-600"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              {user?.github_username && (
                <a
                  href={`https://github.com/${user.github_username}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300 mt-0.5"
                >
                  <Github size={13} />@{user.github_username}
                </a>
              )}
            </div>
          </div>
          <button
            onClick={() => editing ? setEditing(false) : setEditing(true)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors"
          >
            {editing ? <><X size={14} />Cancelar</> : <><Edit3 size={14} />Editar</>}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">GitHub Username</label>
                <input
                  value={form.github_username}
                  onChange={e => setForm({ ...form, github_username: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Rol</label>
                <select
                  value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nivel</label>
                <select
                  value={form.experience_level} onChange={e => setForm({ ...form, experience_level: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Bio</label>
              <textarea
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={2}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map(skill => (
                  <button
                    key={skill} type="button" onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                      ${form.skills.includes(skill)
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-500'}`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Save size={15} />{saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge label={user?.role} color="indigo" />
              <Badge label={user?.experience_level} color="slate" />
            </div>
            {user?.bio && <p className="text-slate-300 text-sm">{user.bio}</p>}
            {user?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map(s => <Badge key={s.id} label={s.name} color="purple" />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Teams */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users size={18} className="text-indigo-400" />Mis Equipos
        </h2>
        {teams.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-500">
            <Trophy size={32} className="mx-auto mb-2 text-slate-600" />
            <p>Aún no tienes equipos. ¡Explora issues y únete a uno!</p>
            <Link to="/" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
              Explorar issues →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map(team => (
              <Link
                key={team.id}
                to={`/teams/${team.id}`}
                className="block bg-slate-800 border border-slate-700 hover:border-indigo-600 rounded-xl p-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">{team.name}</span>
                      <Badge label={team.status} color={statusColor(team.status)} />
                    </div>
                    <p className="text-slate-400 text-xs truncate">
                      <Code size={11} className="inline mr-1" />
                      {team.issue?.issue_title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-xs ml-4">
                    <Users size={13} />{team.member_count}/3
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
