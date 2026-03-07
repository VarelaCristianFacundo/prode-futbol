import { useAuth, AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './components/Login'
import Navigation from './components/Navigation'
// import PredictionForm from './components/PredictionForm'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div
        className="loading-container"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 20px',
              border: '4px solid rgba(30, 127, 67, 0.1)',
              borderTop: '4px solid var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            Cargando...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <Navigation />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
