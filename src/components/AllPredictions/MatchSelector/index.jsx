import SelectDropdown from '../../Common/SelectDropdown'

const MatchSelector = ({ matches, selectedMatchId, onMatchChange, disabled, isLoading }) => {
  return (
    <SelectDropdown
      items={matches}
      selectedId={selectedMatchId}
      onSelect={onMatchChange}
      disabled={disabled}
      isLoading={isLoading}
      placeholder="Seleccionar partido..."
      renderButton={match => (
        <>
          #{match.match_number} -
          {match.home_team?.logo_url && (
            <img
              src={match.home_team.logo_url}
              alt={match.home_team.name}
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
          )}
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            vs
          </span>
          {match.away_team?.logo_url && (
            <img
              src={match.away_team.logo_url}
              alt={match.away_team.name}
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
            />
          )}
        </>
      )}
      renderOption={match => (
        <>
          #{match.match_number} -
          {match.home_team?.logo_url && (
            <img
              src={match.home_team.logo_url}
              alt={match.home_team.name}
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
          )}
          <span style={{ flex: 1, fontWeight: '600' }}>
            {match.home_team?.name || 'Local'} vs {match.away_team?.name || 'Visitante'}
          </span>
          {match.away_team?.logo_url && (
            <img
              src={match.away_team.logo_url}
              alt={match.away_team.name}
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
            />
          )}
        </>
      )}
    />
  )
}

export default MatchSelector
