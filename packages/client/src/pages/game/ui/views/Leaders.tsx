import React from 'react'
import PropTypes from 'prop-types'
import useTitleBar from '../hooks/useTitleBar'
import { helpers } from '../util'
import { PlayerNameLabels, ResponsiveTableWrapper } from '../components'
import type { View } from '../../common/types'
import useClickable from '../hooks/useClickable'
import classNames from 'classnames'

const Row = ({ cat, p, rank, season }: { cat: any; p: any; rank: number; season: number }) => {
  const { clicked, toggleClicked } = useClickable()

  return (
    <tr
      className={classNames({
        'table-info': p.userTeam,
        'table-warning': clicked
      })}
      onClick={toggleClicked}
    >
      <td>
        <div style={{ width: 18 }} className="mr-1 float-left">
          {rank}.
        </div>
        <PlayerNameLabels
          pid={p.pid}
          injury={p.injury}
          jerseyNumber={p.jerseyNumber}
          season={season}
          skills={p.ratings.skills}
          watch={p.watch}
        >
          {p.nameAbbrev}
        </PlayerNameLabels>
        <a href={helpers.leagueUrl(['roster', `${p.abbrev}_${p.tid}`, season])} className="mx-2">
          {p.abbrev}
        </a>
      </td>
      <td>{cat.stat === 'WS/48' ? helpers.roundWinp(p.stat) : helpers.roundStat(p.stat, cat.statProp)}</td>
    </tr>
  )
}

const Leaders = ({ categories, playoffs, season }: View<'leaders'>) => {
  useTitleBar({
    title: 'League Leaders',
    jumpTo: true,
    jumpToSeason: season,
    dropdownView: 'leaders',
    dropdownFields: {
      seasons: season,
      playoffs
    }
  })

  return (
    <>
      <p>
        Only eligible players are shown (<i>e.g.</i> a player shooting 2 for 2 on the season is not eligible for the
        league lead in FG%).
      </p>

      <div className="row" style={{ marginTop: -14 }}>
        {categories.map((cat) => (
          <div key={cat.name} className="col-12 col-sm-6 col-md-4" style={{ marginTop: 14 }}>
            <ResponsiveTableWrapper>
              <table className="table table-striped table-sm leaders">
                <thead>
                  <tr title={cat.title}>
                    <th>{cat.name}</th>
                    <th>{cat.stat}</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.data.map((p, j) => (
                    <Row key={p.pid} cat={cat} p={p} rank={j + 1} season={season} />
                  ))}
                </tbody>
              </table>
            </ResponsiveTableWrapper>
          </div>
        ))}
      </div>
    </>
  )
}

Leaders.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  playoffs: PropTypes.oneOf(['playoffs', 'regularSeason']).isRequired,
  season: PropTypes.number.isRequired
}

export default Leaders
