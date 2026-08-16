import { useState } from 'react'
import { teamApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { X, Plus } from 'lucide-react'

export default function CreateTeamModal({ issues, onClose, onCreated, defaultIssueId }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    issue_id: defaultIssueId || (issues[0]?.id ?? ''),
    role_in_team: user?.role || 'Leader',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await teamApi.create({ ...form, issue_id: Number(form.issue_id) })
      onCreated()
    } catch (err) {
      setError(err.response?.data?.error || 'Error creando equipo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Crear Equipo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Nombre del equipo</label>
            <input
              required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Team Awesome"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Issue</label>
            {issues.length === 0 ? (
              <p className="text-slate-500 text-sm">No hay issues importadas. Importa una desde Explorar.</p>
            ) : (
              <select
                required value={form.issue_id}
                onChange={e => setForm({ ...form, issue_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {issues.map(i => (
                  <option key={i.id} value={i.id}>
                    [{i.language || '?'}] {i.issue_title.slice(0, 60)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1.5">Tu rol en el equipo</label>
            <input
              value={form.role_in_team}
              onChange={e => setForm({ ...form, role_in_team: e.target.value })}
              placeholder="Leader, Frontend, Backend..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading || issues.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={15} />{loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
