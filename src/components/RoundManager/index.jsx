import { useState, useEffect, useCallback } from 'react'
import { Calendar, CircleCheck, Lock, CheckCircle, Clock, Users, RefreshCw, AlertTriangle, XCircle } from 'lucide-react'
import { useRounds } from '../../hooks/useRounds'
import { supabase } from '../../lib/supabase'
import Toast from '../Common/Toast'

export default function RoundManager() {
  const { rounds, activeRound, updateRoundStatus, finishRound, loading } = useRounds()
  const [matchesByRound, setMatchesByRound] = useState({})
  const [syncLoading, setSyncLoading] = useState(false)
  // const [roundNumber, setRoundNumber] = useState(1)
  // const [adminLoading, setAdminLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [usersPredictions, setUsersPredictions] = useState([])
  const [showDetails, setShowDetails] = useState(false)

  // Cargar información de partidos para cada fecha
  useEffect(() => {
    const fetchMatchesInfo = async () => {
      if (!rounds || rounds.length === 0) return

      try {
        const { data: matches, error } = await supabase
          .from('matches')
          .select('id, round_number, is_finished, home_score, away_score')
          .order('round_number', { ascending: true })

        if (error) throw error

        // Organizar partidos por fecha
        // Un partido cuenta como finalizado si is_finished=true O si tiene resultado (home_score y away_score seteados)
        const matchesMap = {}
        matches?.forEach(match => {
          if (!matchesMap[match.round_number]) {
            matchesMap[match.round_number] = {
              total: 0,
              finished: 0,
            }
          }
          matchesMap[match.round_number].total += 1
          if (match.is_finished || (match.home_score !== null && match.away_score !== null)) {
            matchesMap[match.round_number].finished += 1
          }
        })

        setMatchesByRound(matchesMap)
      } catch {
        // TODO: manejar error de forma más elegante, quizás con un toast específico para esta sección
        // console.error('Error cargando información de partidos:', error)
      }
    }

    fetchMatchesInfo()
  }, [rounds])

  // Cargar información de predicciones de usuarios para la fecha activa
  useEffect(() => {
    const fetchUsersPredictions = async () => {
      if (!activeRound) {
        setUsersPredictions([])
        return
      }

      try {
        // La función ahora detecta automáticamente la fecha abierta
        const { data, error } = await supabase.rpc('get_round_predictions_summary')

        if (error) throw error

        // Mapear los datos al formato que usa el componente
        const usersData = data.map(user => ({
          id: user.user_id,
          name: user.user_name,
          totalMatches: user.total_matches,
          predictedCount: user.predicted_count,
          missingMatches: user.missing_matches,
          progress: parseFloat(user.progress),
          roundNumber: user.round_number, // Para debug
        }))

        setUsersPredictions(usersData)
      } catch {
        // TODO: manejar error de forma más elegante, quizás con un toast específico para esta sección
        // console.error('Error cargando predicciones de usuarios:', error)
      }
    }

    fetchUsersPredictions()
  }, [activeRound])

  const getStatusConfig = useCallback(status => {
    const configs = {
      pending: {
        bg: 'rgba(156, 163, 175, 0.1)',
        border: 'var(--color-text-secondary)',
        color: 'var(--color-text-secondary)',
        icon: <Clock size={14} />,
        label: 'Pendiente',
      },
      open: {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: '#10b981',
        color: '#047857',
        icon: <CircleCheck size={14} />,
        label: 'Abierta',
      },
      locked: {
        bg: 'rgba(239, 68, 68, 0.1)',
        border: 'var(--color-error)',
        color: 'var(--color-error)',
        icon: <Lock size={14} />,
        label: 'Bloqueada',
      },
      finished: {
        bg: 'rgba(59, 130, 246, 0.1)',
        border: 'var(--color-info)',
        color: 'var(--color-info)',
        icon: <CheckCircle size={14} />,
        label: 'Finalizada',
      },
    }
    return configs[status] || configs.pending
  }, [])

  // Funciones administrativas
  // const callRpcFunction = useCallback(async (functionName, params) => {
  //   setAdminLoading(true)

  //   try {
  //     const { data, error } = await supabase.rpc(functionName, params)

  //     if (error) throw error

  //     setToast({
  //       message: data.message || 'Operación completada',
  //       type: 'success',
  //     })
  //   } catch (error) {
  //     console.error('Error:', error)
  //     setToast({
  //       message: `Error: ${error.message}`,
  //       type: 'error',
  //     })
  //   } finally {
  //     setAdminLoading(false)
  //   }
  // }, [])

  // const handleRecalculate = useCallback(() => {
  //   if (confirm(`¿Recalcular puntos de la Fecha ${roundNumber}?`)) {
  //     callRpcFunction('recalculate_round', { round_num: roundNumber })
  //   }
  // }, [roundNumber, callRpcFunction])

  // const handleReset = useCallback(() => {
  //   if (
  //     confirm(
  //       `⚠️ ¿RESETEAR COMPLETAMENTE la Fecha ${roundNumber}?\n\nEsto eliminará:\n• Puntos de round_scores\n• Reseteará predicciones\n• Limpiará resultados de partidos`
  //     )
  //   ) {
  //     callRpcFunction('reset_round', { round_num: roundNumber })
  //   }
  // }, [roundNumber, callRpcFunction])

  // const handleForceFinish = useCallback(() => {
  //   if (
  //     confirm(
  //       `¿Forzar finalización de Fecha ${roundNumber}?\n\nLos partidos sin resultado pasarán a 0-0`
  //     )
  //   ) {
  //     callRpcFunction('force_finish_round', { round_num: roundNumber })
  //   }
  // }, [roundNumber, callRpcFunction])

  // const handleLockRound = useCallback(async () => {
  //   if (!activeRound) {
  //     setToast({
  //       message: 'No hay fecha activa para bloquear',
  //       type: 'warning',
  //     })
  //     return
  //   }
  //   if (
  //     confirm(
  //       `¿Bloquear la Fecha ${activeRound.round_number}? Los usuarios no podrán editar sus pronósticos.`
  //     )
  //   ) {
  //     const { error } = await lockRound(activeRound.round_number)
  //     if (error) {
  //       setToast({
  //         message: `Error: ${error.message}`,
  //         type: 'error',
  //       })
  //     } else {
  //       setToast({
  //         message: 'Fecha bloqueada correctamente',
  //         type: 'success',
  //       })
  //     }
  //   }
  // }, [activeRound, lockRound])

  const handleFinishRound = useCallback(
    async roundNumber => {
      // Validar que todos los partidos estén finalizados
      const matchInfo = matchesByRound[roundNumber]

      if (!matchInfo || matchInfo.total === 0) {
        setToast({
          message: 'Esta fecha no tiene partidos cargados',
          type: 'warning',
        })
        return
      }

      if (matchInfo.finished < matchInfo.total) {
        setToast({
          message: `No se puede finalizar. Partidos finalizados: ${matchInfo.finished}/${matchInfo.total}`,
          type: 'warning',
        })
        return
      }

      if (confirm(`¿Finalizar la Fecha ${roundNumber}? Se calcularán los puntajes.`)) {
        const { error } = await finishRound(roundNumber)
        if (error) {
          setToast({
            message: `Error: ${error.message}`,
            type: 'error',
          })
        } else {
          setToast({
            message: 'Fecha finalizada correctamente',
            type: 'success',
          })
        }
      }
    },
    [matchesByRound, finishRound]
  )

  const handleChangeStatus = useCallback(
    async (roundNumber, newStatus, currentStatus, roundId) => {
      // Prevenir modificación de fechas finalizadas
      if (currentStatus === 'finished') {
        setToast({
          message: 'No se puede modificar una fecha finalizada',
          type: 'error',
        })
        return
      }

      // Prevenir abrir una fecha si ya hay otra abierta
      if (newStatus === 'open') {
        const openRound = rounds.find(r => r.status === 'open' && r.id !== roundId)
        if (openRound) {
          setToast({
            message: `Ya hay una fecha abierta (Fecha ${openRound.round_number}). Bloqueala o finalizala antes.`,
            type: 'error',
          })
          return
        }
      }

      const statusNames = {
        pending: 'Pendiente',
        open: 'Abierta',
        locked: 'Bloqueada',
        finished: 'Finalizada',
      }

      if (confirm(`¿Cambiar estado de Fecha ${roundNumber} a "${statusNames[newStatus]}"?`)) {
        const { error } = await updateRoundStatus(roundNumber, newStatus)
        if (error) {
          setToast({
            message: `Error: ${error.message}`,
            type: 'error',
          })
        } else {
          setToast({
            message: 'Estado actualizado',
            type: 'success',
          })
        }
      }
    },
    [rounds, updateRoundStatus]
  )

  const handleSyncStatuses = useCallback(async () => {
    if (!rounds.length || Object.keys(matchesByRound).length === 0) {
      setToast({ message: 'Cargando datos de partidos, intentá de nuevo', type: 'warning' })
      return
    }

    setSyncLoading(true)
    try {
      // Paso 1: corregir is_finished en partidos que tienen resultado pero el flag no está activado
      const { error: matchFixError } = await supabase
        .from('matches')
        .update({ is_finished: true })
        .not('home_score', 'is', null)
        .not('away_score', 'is', null)
        .eq('is_finished', false)
      if (matchFixError) throw matchFixError

      // Paso 2: refrescar matchesByRound con datos actualizados
      const { data: freshMatches, error: fetchError } = await supabase
        .from('matches')
        .select('round_number, is_finished, home_score, away_score')
      if (fetchError) throw fetchError

      const freshMap = {}
      freshMatches?.forEach(m => {
        if (!freshMap[m.round_number]) freshMap[m.round_number] = { total: 0, finished: 0 }
        freshMap[m.round_number].total += 1
        if (m.is_finished || (m.home_score !== null && m.away_score !== null)) {
          freshMap[m.round_number].finished += 1
        }
      })

      // Paso 3: calcular nuevo estado de cada fecha
      // Orden de mayor a menor: la fecha "abierta" es la más reciente con partidos en curso
      const sorted = [...rounds].sort((a, b) => b.round_number - a.round_number)
      let openAssigned = false
      const updates = []

      for (const r of sorted) {
        if (r.status === 'finished') continue // no tocar finalizadas
        const mInfo = freshMap[r.round_number] || { total: 0, finished: 0 }

        let newStatus
        if (mInfo.total > 0 && mInfo.finished === mInfo.total) {
          newStatus = 'finished'
        } else if (mInfo.finished > 0 && !openAssigned) {
          // La fecha más reciente con algún partido jugado (pero no todos) = abierta
          newStatus = 'open'
          openAssigned = true
        } else if (mInfo.finished > 0 && openAssigned) {
          newStatus = 'locked'
        } else {
          newStatus = 'pending'
        }

        if (newStatus !== r.status) {
          updates.push({ roundNumber: r.round_number, newStatus })
        }
      }

      if (updates.length === 0) {
        setToast({ message: 'Los estados ya están actualizados', type: 'success' })
        return
      }

      let hasError = false
      for (const { roundNumber, newStatus } of updates) {
        const { error } = await updateRoundStatus(roundNumber, newStatus)
        if (error) { hasError = true; break }
      }

      setToast({
        message: hasError
          ? 'Error al sincronizar algunos estados'
          : `${updates.length} fecha(s) actualizadas correctamente`,
        type: hasError ? 'error' : 'success',
      })
    } catch (err) {
      setToast({ message: `Error: ${err.message}`, type: 'error' })
    } finally {
      setSyncLoading(false)
    }
  }, [rounds, matchesByRound, updateRoundStatus])

  if (loading) {
    return (
      <div
        className="container"
        style={{ maxWidth: '1000px', textAlign: 'center', padding: '48px 16px' }}
      >
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
          Cargando fechas...
        </p>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <Calendar size={28} />
          <span>Gestión de Fechas</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Administrá el estado de cada fecha del torneo
        </p>
      </div>

      {/* Active Round Card */}
      {activeRound && (
        <div
          className="card"
          style={{
            marginBottom: '32px',
            backgroundColor: 'var(--color-surface)',
            border: '3px solid #10b981',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            padding: '28px',
          }}
        >
          {/* Barra lateral verde */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '8px',
              background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
            }}
          />

          <div style={{ paddingLeft: '16px' }}>
            {/* Header */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                padding: '8px 18px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <CircleCheck size={18} style={{ color: '#047857' }} />
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: '#047857',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                }}
              >
                Fecha Activa
              </span>
            </div>

            {/* Round Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                }}
              >
                <Calendar size={32} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: 1,
                    marginBottom: '8px',
                  }}
                >
                  Fecha {activeRound.round_number}
                </p>
                <p
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}
                >
                  Los usuarios pueden cargar sus pronósticos
                </p>
              </div>
            </div>

            {/* DEBUG INFO */}
            {/* <div
              style={{
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
              }}
            >
              <strong>🔍 DEBUG:</strong>
              <div>usersPredictions.length: {usersPredictions.length}</div>
              <div>activeRound: {activeRound ? `Fecha ${activeRound.round_number}` : 'null'}</div>
              <div>
                Fecha consultada en SQL:{' '}
                {usersPredictions.length > 0 ? usersPredictions[0].roundNumber : 'N/A'}
              </div>
              <div>
                Datos:{' '}
                {usersPredictions.length > 0 ? JSON.stringify(usersPredictions[0]) : 'Sin datos'}
              </div>
            </div> */}

            {/* Users Progress Summary */}
            {usersPredictions.length > 0 && (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '2px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Users size={28} />
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        Progreso de Usuarios
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          color: 'var(--color-text-secondary)',
                          marginTop: '2px',
                        }}
                      >
                        {usersPredictions.filter(u => u.progress === 100).length} de{' '}
                        {usersPredictions.length} completaron la fecha
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    style={{
                      background: showDetails
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(16, 185, 129, 0.1)',
                      color: '#047857',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '2px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{showDetails ? '▼' : '▶'}</span>
                    <span>{showDetails ? 'Ocultar detalles' : 'Ver detalles'}</span>
                  </button>
                </div>

                {/* Summary Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: showDetails ? '20px' : '0',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '2px solid rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#10b981',
                        marginBottom: '4px',
                      }}
                    >
                      {usersPredictions.filter(u => u.progress === 100).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Completaron
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '2px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#f59e0b',
                        marginBottom: '4px',
                      }}
                    >
                      {usersPredictions.filter(u => u.progress > 0 && u.progress < 100).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      En progreso
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '12px',
                      borderRadius: '10px',
                      textAlign: 'center',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#ef4444',
                        marginBottom: '4px',
                      }}
                    >
                      {usersPredictions.filter(u => u.progress === 0).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Sin empezar
                    </div>
                  </div>
                </div>

                {/* Detailed User List */}
                {showDetails && (
                  <div
                    style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      borderTop: '2px solid rgba(16, 185, 129, 0.15)',
                      paddingTop: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {usersPredictions
                        .sort((a, b) => b.progress - a.progress)
                        .map(user => (
                          <div
                            key={user.id}
                            style={{
                              backgroundColor: 'white',
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: `2px solid ${
                                user.progress === 100
                                  ? '#10b981'
                                  : user.progress > 0
                                    ? '#f59e0b'
                                    : '#ef4444'
                              }`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '6px',
                                }}
                              >
                                <span style={{ fontSize: '1.1rem' }}>
                                  {user.progress === 100 ? <CheckCircle size={16} color="#10b981" /> : user.progress > 0 ? <AlertTriangle size={16} color="#f59e0b" /> : <XCircle size={16} color="#ef4444" />}
                                </span>
                                <span
                                  style={{
                                    fontWeight: '600',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.95rem',
                                  }}
                                >
                                  {user.name}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: '0.8rem',
                                  color: 'var(--color-text-secondary)',
                                }}
                              >
                                {user.predictedCount} de {user.totalMatches} partidos
                              </div>
                            </div>

                            <div style={{ flex: '0 0 auto', minWidth: 0, maxWidth: '100%' }}>
                              {user.missingMatches.length > 0 ? (
                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '6px',
                                    width: '100%',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--color-text-secondary)',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Faltan partidos:
                                  </span>
                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: '4px',
                                      flexWrap: 'wrap',
                                      justifyContent: 'flex-end',
                                      maxWidth: '200px',
                                    }}
                                  >
                                    {user.missingMatches.map(matchNum => (
                                      <span
                                        key={matchNum}
                                        style={{
                                          backgroundColor: '#fef3c7',
                                          color: '#92400e',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.75rem',
                                          fontWeight: '700',
                                          border: '1px solid #fcd34d',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        #{matchNum}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <span
                                  style={{
                                    backgroundColor: '#d1fae5',
                                    color: '#065f46',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                  }}
                                >
                                  Completo ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rounds List */}
      <div className="card" style={{ padding: '16px 16px 0' }}>
        {/* Sync button */}
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSyncStatuses}
            disabled={syncLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '2px solid var(--color-primary)',
              background: 'transparent',
              color: 'var(--color-primary)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: syncLoading ? 'not-allowed' : 'pointer',
              opacity: syncLoading ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
            title="Actualiza automáticamente el estado de cada fecha según los partidos finalizados"
          >
            <RefreshCw size={14} style={syncLoading ? { animation: 'spin 1s linear infinite' } : {}} />
            {syncLoading ? 'Sincronizando...' : 'Sincronizar estados'}
          </button>
        </div>
        <div style={{ padding: '0' }}>
          <div
            style={{
              display: 'grid',
              gap: '12px',
            }}
          >
            {rounds.map(round => {
              const statusConfig = getStatusConfig(round.status)
              const isActive = round.status === 'open'

              return (
                <div
                  key={round.id}
                  style={{
                    border: `2px solid ${isActive ? statusConfig.border : 'var(--color-border)'}`,
                    borderRadius: '12px',
                    padding: '12px',
                    backgroundColor: isActive ? statusConfig.bg : 'var(--color-surface)',
                    transition: 'all 0.2s',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {/* Round Info - Optimizada */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      Fecha {round.round_number}
                    </span>
                    <span
                      style={{
                        backgroundColor: statusConfig.bg,
                        border: `2px solid ${statusConfig.border}`,
                        color: statusConfig.color,
                        padding: '3px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </span>
                  </div>

                  {/* Status Selector */}
                  <select
                    value={round.status}
                    onChange={e =>
                      handleChangeStatus(round.round_number, e.target.value, round.status, round.id)
                    }
                    disabled={round.status === 'finished'}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '2px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: round.status === 'finished' ? 'not-allowed' : 'pointer',
                      opacity: round.status === 'finished' ? 0.6 : 1,
                      outline: 'none',
                      transition: 'all 0.2s',
                      marginBottom: round.status === 'locked' ? '12px' : '0',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                    }}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="open">Abierta</option>
                    <option value="locked">Bloqueada</option>
                    <option value="finished">Finalizada</option>
                  </select>

                  {/* Botón Finalizar */}
                  {round.status === 'locked' && (
                    <button
                      onClick={() => handleFinishRound(round.round_number)}
                      disabled={
                        !matchesByRound[round.round_number] ||
                        matchesByRound[round.round_number]?.finished <
                          matchesByRound[round.round_number]?.total
                      }
                      style={{
                        width: '100%',
                        background:
                          !matchesByRound[round.round_number] ||
                          matchesByRound[round.round_number]?.finished <
                            matchesByRound[round.round_number]?.total
                            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor:
                          !matchesByRound[round.round_number] ||
                          matchesByRound[round.round_number]?.finished <
                            matchesByRound[round.round_number]?.total
                            ? 'not-allowed'
                            : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        opacity:
                          !matchesByRound[round.round_number] ||
                          matchesByRound[round.round_number]?.finished <
                            matchesByRound[round.round_number]?.total
                            ? 0.6
                            : 1,
                      }}
                      onMouseEnter={e => {
                        if (
                          matchesByRound[round.round_number] &&
                          matchesByRound[round.round_number]?.finished ===
                            matchesByRound[round.round_number]?.total
                        ) {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                      title={
                        !matchesByRound[round.round_number]
                          ? 'No hay partidos en esta fecha'
                          : matchesByRound[round.round_number]?.finished <
                              matchesByRound[round.round_number]?.total
                            ? `Partidos finalizados: ${matchesByRound[round.round_number]?.finished}/${matchesByRound[round.round_number]?.total}`
                            : 'Todos los partidos están finalizados'
                      }
                    >
                      <CheckCircle size={16} />
                      <span>
                        Finalizar
                        {matchesByRound[round.round_number] &&
                          ` (${matchesByRound[round.round_number]?.finished}/${matchesByRound[round.round_number]?.total})`}
                      </span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Info Card */}
      {/* <div
        className="card"
        style={{
          marginTop: '24px',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '2px solid #3b82f6',
        }}
      >
        <h3
          style={{
            fontWeight: '700',
            color: '#1e40af',
            marginBottom: '12px',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>ℹ️</span>
          <span>Estados de las Fechas</span>
        </h3>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.9rem',
            color: '#1e40af',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>⏳</span>
            <strong>Pendiente:</strong>
            <span style={{ color: '#4b5563' }}>Fecha creada pero aún no abierta</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🟢</span>
            <strong>Abierta:</strong>
            <span style={{ color: '#4b5563' }}>Los usuarios pueden cargar pronósticos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🔒</span>
            <strong>Bloqueada:</strong>
            <span style={{ color: '#4b5563' }}>No se pueden modificar pronósticos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <strong>Finalizada:</strong>
            <span style={{ color: '#4b5563' }}>
              Todos los partidos finalizaron y puntajes calculados
            </span>
          </div>
        </div>
      </div> */}

      {/* Botón Bloquear Fecha - Movido aquí */}
      {/* {activeRound && (
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={handleLockRound}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '18px 28px',
              borderRadius: '14px',
              border: 'none',
              fontWeight: '700',
              fontSize: '1.05rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(239, 68, 68, 0.45)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            <span>Bloquear Fecha {activeRound.round_number}</span>
          </button>
        </div>
      )} */}

      {/* Panel de Administración */}
      {/* <div
        className="card"
        style={{
          marginTop: '24px',
          marginBottom: '24px',
          padding: '24px',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '2px solid #ef4444',
        }}
      >
        <h3
          style={{
            marginBottom: '16px',
            color: '#b91c1c',
            fontSize: '1.1rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>🔧</span>
          <span>Panel de Administración</span>
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
            }}
          >
            Número de Fecha:
          </label>
          <input
            type="number"
            value={roundNumber}
            onChange={e => setRoundNumber(parseInt(e.target.value) || 1)}
            min="1"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '2px solid #E0E0E0',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#E0E0E0'
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleRecalculate}
            disabled={adminLoading}
            style={{
              flex: '1 1 auto',
              minWidth: '150px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: adminLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: adminLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!adminLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.45)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🔄</span>
            <span>{adminLoading ? 'Procesando...' : 'Recalcular Puntos'}</span>
          </button>

          <button
            onClick={handleReset}
            disabled={adminLoading}
            style={{
              flex: '1 1 auto',
              minWidth: '150px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: adminLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: adminLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!adminLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.45)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🗑️</span>
            <span>{adminLoading ? 'Procesando...' : 'Resetear Fecha'}</span>
          </button>

          <button
            onClick={handleForceFinish}
            disabled={adminLoading}
            style={{
              flex: '1 1 auto',
              minWidth: '150px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: '14px 20px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: adminLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: adminLoading ? 0.6 : 1,
            }}
            onMouseEnter={e => {
              if (!adminLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.45)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🏁</span>
            <span>{adminLoading ? 'Procesando...' : 'Forzar Finalización'}</span>
          </button>
        </div>
      </div> */}

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
