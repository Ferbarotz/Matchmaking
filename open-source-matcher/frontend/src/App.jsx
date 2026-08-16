import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ExplorePage from './pages/ExplorePage'
import DashboardPage from './pages/DashboardPage'
import TeamsPage from './pages/TeamsPage'
import TeamSpacePage from './pages/TeamSpacePage'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ExplorePage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/teams"
            element={<ProtectedRoute><TeamsPage /></ProtectedRoute>}
          />
          <Route
            path="/teams/:id"
            element={<ProtectedRoute><TeamSpacePage /></ProtectedRoute>}
          />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
