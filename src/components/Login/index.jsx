import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Toast from '../Common/Toast'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        if (!username || !fullName) {
          throw new Error('Username y nombre completo son requeridos')
        }
        const { error } = await signUp(email, password, username, fullName)
        if (error) throw error
        setToast({
          message: 'Usuario creado! Por favor verifica tu email.',
          type: 'success',
        })
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: '24px',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/icono.png" alt="Prode Tsoft" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'var(--color-primary)',
              marginBottom: '8px',
            }}
          >
            Prode Tsoft
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {!isLogin && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                  }}
                  required
                />
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
              }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#e2e8f0'
              }}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Cargando...' : isLogin ? 'Ingresar' : 'Registrarse'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="btn-text"
            style={{ width: '100%' }}
          >
            {isLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Ingresá'}
          </button>
        </div>
      </div>

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
