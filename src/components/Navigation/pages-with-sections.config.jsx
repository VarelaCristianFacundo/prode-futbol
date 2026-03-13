import { BarChart2, Eye, Trophy, Target, Scale, ClipboardList, TrendingUp, CircleDot, Calendar } from 'lucide-react'

/**
 * Configuración de páginas que tienen secciones internas
 * Esto permite mostrar las secciones en NavTabs de forma dinámica y escalable
 */

export const TOURNAMENT_SECTIONS = [
  { id: 'predictions', label: 'Mis Pronósticos', mobileLabel: 'Pronósticos', icon: <BarChart2 size={18} /> },
  { id: 'all-predictions', label: 'Ver Pronósticos', mobileLabel: 'Rivales', icon: <Eye size={18} /> },
  { id: 'leaderboard', label: 'Tabla de Posiciones', mobileLabel: 'Tabla', icon: <Trophy size={18} /> },
]

export const INFO_SECTIONS = [
  { id: 'points', label: 'Sistema de Puntos', icon: <Target size={18} /> },
  { id: 'tiebreaks', label: 'Desempates', icon: <Scale size={18} /> },
  { id: 'match-status', label: 'Estado de Partidos', icon: <ClipboardList size={18} /> },
]

export const STATS_SECTIONS = [{ id: 'personal', label: 'Estadísticas Personales', icon: <TrendingUp size={18} /> }]

export const ADMIN_SECTIONS = [
  { id: 'admin-matches', label: 'Gestionar Partidos', mobileLabel: 'Partidos', icon: <CircleDot size={18} /> },
  { id: 'admin-rounds', label: 'Gestionar Fechas', mobileLabel: 'Fechas', icon: <Calendar size={18} /> },
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
