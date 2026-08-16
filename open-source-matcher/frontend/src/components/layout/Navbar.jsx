import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Github, Users, LayoutDashboard, Search, LogOut, LogIn } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const navLink = (to, label, Icon) => (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${pathname === to
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
    >
      <Icon size={16} />{label}
    </Link>
  )

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <Github size={22} className="text-indigo-400" />
          <span>Junior<span className="text-indigo-400">Matcher</span></span>
        </Link>

        <div className="flex items-center gap-1">
          {navLink('/', 'Explorar', Search)}
          {user && navLink('/dashboard', 'Dashboard', LayoutDashboard)}
          {user && navLink('/teams', 'Equipos', Users)}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-slate-400 text-sm hidden sm:inline">
                @{user.username}
              </span>
              <img
                src={user.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-slate-600"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-400 hover:text-red-400 px-2 py-1 rounded text-sm transition-colors"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <LogIn size={16} />Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
