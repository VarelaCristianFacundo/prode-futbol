/**
 * Configuración de páginas que tienen secciones internas
 * Esto permite mostrar las secciones en NavTabs de forma dinámica y escalable
 */

export const TOURNAMENT_SECTIONS = [
  { id: 'predictions', label: 'Mis Pronósticos', mobileLabel: 'Pronósticos', icon: '📊' },
  { id: 'all-predictions', label: 'Ver Pronósticos', mobileLabel: 'Rivales', icon: '👀' },
  { id: 'leaderboard', label: 'Tabla de Posiciones', mobileLabel: 'Tabla', icon: '🏆' },
]

export const INFO_SECTIONS = [
  { id: 'points', label: 'Sistema de Puntos', icon: '🎯' },
  { id: 'tiebreaks', label: 'Desempates', icon: '⚖️' },
  { id: 'match-status', label: 'Estado de Partidos', icon: '📋' },
]

export const STATS_SECTIONS = [{ id: 'personal', label: 'Estadísticas Personales', icon: '📈' }]

export const ADMIN_SECTIONS = [
  { id: 'admin-matches', label: 'Gestionar Partidos', mobileLabel: 'Partidos', icon: '⚽' },
  { id: 'admin-rounds', label: 'Gestionar Fechas', mobileLabel: 'Fechas', icon: '📅' },
]

/**
 * Mapeo de vistas principales a sus secciones
 * Clave: ID de la vista principal (ej: 'tournament', 'info', 'admin')
 * Valor: { sections: array de secciones, defaultSection: sección por defecto }
 */
export const PAGES_WITH_SECTIONS = {
  tournament: {
    sections: TOURNAMENT_SECTIONS,
    defaultSection: 'predictions',
  },
  info: {
    sections: INFO_SECTIONS,
    defaultSection: 'points',
  },
  stats: {
    sections: STATS_SECTIONS,
    defaultSection: 'personal',
  },
  admin: {
    sections: ADMIN_SECTIONS,
    defaultSection: 'admin-matches',
  },
}

/**
 * Verifica si una vista tiene secciones configuradas
 * @param {string} viewId - ID de la vista
 * @returns {boolean}
 */
export function hasViewSections(viewId) {
  return viewId in PAGES_WITH_SECTIONS
}

/**
 * Obtiene las secciones de una vista
 * @param {string} viewId - ID de la vista
 * @returns {Array|null}
 */
export function getViewSections(viewId) {
  return PAGES_WITH_SECTIONS[viewId]?.sections || null
}

/**
 * Obtiene la sección por defecto de una vista
 * @param {string} viewId - ID de la vista
 * @returns {string|null}
 */
export function getDefaultSection(viewId) {
  return PAGES_WITH_SECTIONS[viewId]?.defaultSection || null
}
