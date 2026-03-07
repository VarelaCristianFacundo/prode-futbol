// Configuración del menú hamburguesa - Navegación global

export const MENU_ITEMS = [
  {
    id: 'tournament',
    label: 'Torneo Local',
    icon: '🏆',
    description: 'Pronósticos, rivales y tabla',
    adminOnly: false,
    viewType: 'tournament',
  },
  {
    id: 'info',
    label: 'Información del Torneo',
    icon: 'ℹ️',
    description: 'Reglas, puntos y desempates',
    adminOnly: false,
    viewType: 'info',
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    icon: '📈',
    description: 'Ver estadísticas personales y generales',
    adminOnly: false,
    viewType: 'stats',
  },
  {
    id: 'admin-divider',
    type: 'divider',
    label: 'ADMINISTRACIÓN',
    adminOnly: true,
  },
  {
    id: 'admin',
    label: 'Administración',
    icon: '⚙️',
    description: 'Gestionar partidos y fechas',
    adminOnly: true,
    viewType: 'admin',
  },
  {
    id: 'logout',
    type: 'logout',
    label: 'Cerrar Sesión',
    description: 'Salir de tu cuenta',
    adminOnly: false,
  },
]

// Configuración de la vista de Información
export const INFO_SECTIONS = [
  {
    id: 'points',
    label: 'Sistema de Puntos',
    icon: '🎯',
  },
  {
    id: 'tiebreaks',
    label: 'Desempates',
    icon: '⚖️',
  },
  {
    id: 'special-rules',
    label: 'Reglas Especiales',
    icon: '⭐',
  },
  {
    id: 'match-status',
    label: 'Estado de Partidos',
    icon: '📋',
  },
]
