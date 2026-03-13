import { Target, CheckCircle, TrendingUp, Ban } from 'lucide-react'

// Datos del torneo - separados de la UI para fácil mantenimiento
export const pointsSystemData = [
  {
    id: 'pleno',
    icon: <Target size={28} color="var(--color-success)" />,
    title: 'PLENO (resultado exacto):',
    rules: [
      {
        condition: 'Más de 2 goles:',
        points: 'puntos = cantidad de goles',
      },
      {
        condition: '2 o menos goles:',
        points: '2 puntos',
      },
    ],
  },
  {
    id: 'low-goals',
    icon: <CheckCircle size={28} color="var(--color-warning)" />,
    title: 'Partidos de hasta 2 goles (acertar ganador/empate):',
    points: '1 punto',
  },
  {
    id: 'high-goals',
    icon: <TrendingUp size={28} color="var(--color-info)" />,
    title: 'Más de 3 goles predichos ( acertar cantidad total de goles ) :',
    points: '1 punto',
  },
]

export const tiebreakCriteria = [
  {
    order: '1.',
    title: 'Partido de la fecha',
    description: 'Ej: en la fecha 5, se toma el partido 5',
  },
  {
    order: '2.',
    title: 'Comparativa partido donde hayan sacado más Puntos',
  },
  {
    order: '3.',
    title: 'Partido Interzonal',
  },
  {
    order: '4.',
    title: 'Sorteo',
  },
]

export const specialRule = {
  icon: <Ban size={20} color="var(--color-error)" />,
  title: 'Regla especial:',
  description: 'Nadie puede ganar más de 3 fechas, después de eso solo se compite por el trofeo.',
  note: 'Si pasa, el premio de la fecha se entrega al jugador que quedó en segunda posición.',
}
