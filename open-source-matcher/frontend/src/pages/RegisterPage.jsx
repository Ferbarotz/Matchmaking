import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Github, UserPlus } from 'lucide-react'

const ROLES = ['Frontend', 'Backend', 'Fullstack']
const LEVELS = ['Junior', 'Mid', 'Senior']
const COMMON_SKILLS = ['React', 'Python', 'JavaScript', 'TypeScript', 'Flask', 'Node.js', 'CSS', 'SQL', 'Docker']

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', password: '', github_username: '',
    role: 'Fullstack', experience_level: 'Junior', bio: '', skills: [],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Github size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-slate-400 mt-1">Únete a la comunidad de juniors colaborativos</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 space-y-5">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                required value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="juan_dev"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub Username</label>
              <input
                value={form.github_username}
                onChange={e => setForm({ ...form, github_username: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="juandev"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
            <input
              type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="mínimo 6 caracteres"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Rol</label>
              <select
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nivel</label>
              <select
                value={form.experience_level} onChange={e => setForm({ ...form, experience_level: e.target.value })}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tecnologías</label>
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

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Bio</label>
            <textarea
              value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Cargando...' : (<><UserPlus size={18} />Crear Cuenta</>)}
          </button>

          <p className="text-center text-slate-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
