import { Trophy, Info, TrendingUp, Settings, Target, Scale, Star, ClipboardList } from 'lucide-react'

// Configuración del menú hamburguesa - Navegación global

export const MENU_ITEMS = [
  {
    id: 'tournament',
    label: 'Torneo Local',
    icon: <Trophy size={20} />,
    description: 'Pronósticos, rivales y tabla',
    adminOnly: false,
    viewType: 'tournament',
  },
  {
    id: 'info',
    label: 'Información del Torneo',
    icon: <Info size={20} />,
    description: 'Reglas, puntos y desempates',
    adminOnly: false,
    viewType: 'info',
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    icon: <TrendingUp size={20} />,
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
    icon: <Settings size={20} />,
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
    icon: <Target size={20} />,
  },
  {
    id: 'tiebreaks',
    label: 'Desempates',
    icon: <Scale size={20} />,
  },
  {
    id: 'special-rules',
    label: 'Reglas Especiales',
    icon: <Star size={20} />,
  },
  {
    id: 'match-status',
    label: 'Estado de Partidos',
    icon: <ClipboardList size={20} />,
  },
]
