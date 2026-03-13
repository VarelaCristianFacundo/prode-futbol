export const ROUND_STATUS_CONFIG = {
  pending: {
    icon: null,
    label: 'Pendiente',
    color: '#9ca3af',
  },
  open: {
    icon: null,
    label: 'En curso',
    color: '#10b981',
  },
  locked: {
    icon: null,
    label: 'En juego',
    color: '#ef4444',
  },
  finished: {
    icon: null,
    label: 'Finalizada',
    color: '#3b82f6',
  },
}

export const POSITION_CONFIG = {
  1: { label: '1', bgColor: 'rgba(249, 168, 37, 0.50)' },
  2: { label: '2', bgColor: 'rgba(189, 189, 189, 0.28)' },
  3: { label: '3', bgColor: 'rgba(205, 127, 50, 0.30)' },
}

export const TABLE_COLUMNS = {
  general: ['Pos', 'Jugador', 'Pts', 'Fch'],
  round: ['Pos', 'Jugador', 'Pts', ''],
}
