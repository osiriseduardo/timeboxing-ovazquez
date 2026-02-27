import { useEffect, useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'

const HOURS = ['5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11']

const createInitialPlanner = () => ({
  date: '',
  priorities: ['', '', ''],
  brainDump: '',
  slots: {},
})

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppLayout({ user, onLogout, children }) {
  return (
    <main className="app-shell">
      <aside className="side-nav">
        <h1>Timeboxing</h1>
        <p>Hola, {user.name}</p>

        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/planner" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Planificador
          </NavLink>
        </nav>

        <button className="ghost-btn" onClick={onLogout} type="button">
          Cerrar sesión
        </button>
      </aside>

      <section className="page-content">{children}</section>
    </main>
  )
}

function LoginPage({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submitForm = (event) => {
    event.preventDefault()

    if (!name.trim() || !email.trim()) {
      setError('Completa nombre y correo para continuar.')
      return
    }

    setError('')
    onLogin({ name: name.trim(), email: email.trim() })
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Daily Timeboxing</h1>
        <p>Ingresa para ver tu dashboard y organizar tu día.</p>

        <form onSubmit={submitForm} className="login-form">
          <label htmlFor="name">Nombre</label>
          <input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} />

          <label htmlFor="email">Correo</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />

          {error ? <span className="error-text">{error}</span> : null}

          <button className="primary-btn" type="submit">
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  )
}

function DashboardPage({ planner }) {
  const usedSlots = useMemo(
    () => Object.values(planner.slots).filter((slot) => slot.trim().length > 0).length,
    [planner.slots],
  )
  const filledPriorities = useMemo(
    () => planner.priorities.filter((priority) => priority.trim().length > 0).length,
    [planner.priorities],
  )
  const brainDumpLines = planner.brainDump
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length

  return (
    <section className="dashboard-page">
      <header>
        <h2>Dashboard</h2>
        <p>Resumen rápido de tu planificación diaria.</p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Bloques ocupados</span>
          <strong>{usedSlots}</strong>
        </article>
        <article className="stat-card">
          <span>Prioridades definidas</span>
          <strong>{filledPriorities}/3</strong>
        </article>
        <article className="stat-card">
          <span>Ideas en Brain Dump</span>
          <strong>{brainDumpLines}</strong>
        </article>
      </div>

      <article className="hint-card">
        <h3>Siguiente paso</h3>
        <p>Termina de llenar primero tus 3 prioridades, luego asigna bloques de tiempo en el planner.</p>
      </article>
    </section>
  )
}

function PlannerPage({ planner, setPlanner }) {
  const updatePriority = (index, value) => {
    setPlanner((current) => {
      const updatedPriorities = [...current.priorities]
      updatedPriorities[index] = value

      return {
        ...current,
        priorities: updatedPriorities,
      }
    })
  }

  const updateSlot = (hour, minute, value) => {
    const key = `${hour}-${minute}`
    setPlanner((current) => ({
      ...current,
      slots: {
        ...current.slots,
        [key]: value,
      },
    }))
  }

  return (
    <section className="planner-page">
      <section className="planner-sheet">
        <header className="planner-header">
          <div className="title-group">
            <h2>Daily Timeboxing</h2>
            <h3>Planner</h3>
          </div>

          <label className="date-group" htmlFor="planner-date">
            <span>Fecha</span>
            <input
              id="planner-date"
              type="date"
              value={planner.date}
              onChange={(event) => setPlanner((current) => ({ ...current, date: event.target.value }))}
            />
          </label>
        </header>

        <div className="planner-content">
          <section className="left-column">
            <h4>Top Priorities</h4>
            {planner.priorities.map((priority, index) => (
              <input
                key={`priority-${index}`}
                type="text"
                className="priority-input"
                value={priority}
                onChange={(event) => updatePriority(index, event.target.value)}
                placeholder={`Prioridad ${index + 1}`}
              />
            ))}

            <h4 className="brain-dump-title">Brain Dump</h4>
            <textarea
              className="brain-dump-area"
              value={planner.brainDump}
              onChange={(event) => setPlanner((current) => ({ ...current, brainDump: event.target.value }))}
              placeholder="Escribe ideas, tareas o recordatorios..."
            />
          </section>

          <section className="right-column" aria-label="Time blocks">
            <div className="time-header">
              <span className="time-spacer" />
              <span>:00</span>
              <span>:30</span>
            </div>

            <div className="time-grid">
              {HOURS.map((hour, index) => (
                <div className="time-row" key={`${hour}-${index}`}>
                  <div className="hour-cell">{hour}</div>

                  <input
                    className="slot-input"
                    value={planner.slots[`${hour}-00`] ?? ''}
                    onChange={(event) => updateSlot(hour, '00', event.target.value)}
                    placeholder=""
                  />

                  <input
                    className="slot-input"
                    value={planner.slots[`${hour}-30`] ?? ''}
                    onChange={(event) => updateSlot(hour, '30', event.target.value)}
                    placeholder=""
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </section>
  )
}

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('tb-user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [planner, setPlanner] = useState(() => {
    const savedPlanner = localStorage.getItem('tb-planner')
    if (!savedPlanner) {
      return createInitialPlanner()
    }

    return {
      ...createInitialPlanner(),
      ...JSON.parse(savedPlanner),
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('tb-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('tb-user')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('tb-planner', JSON.stringify(planner))
  }, [planner])

  const handleLogin = (nextUser) => {
    setUser(nextUser)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={Boolean(user)}>
            <AppLayout user={user} onLogout={handleLogout}>
              <DashboardPage planner={planner} />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/planner"
        element={
          <ProtectedRoute isAuthenticated={Boolean(user)}>
            <AppLayout user={user} onLogout={handleLogout}>
              <PlannerPage planner={planner} setPlanner={setPlanner} />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  )
}

export default App
