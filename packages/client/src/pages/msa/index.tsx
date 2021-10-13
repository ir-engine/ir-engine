import React from 'react'
import { Route, Switch } from 'react-router-dom'
import TeamManagementView from './components/TeamManagementView/TeamManagementView'
import PlayView from './components/PlayView/PlayView'

const MSA = (): any => {
  return (
    <>
      <Switch>
        <Route path="/msa" exact component={PlayView} />
        <Route
          path="/msa/manage-team-staked"
          render={(props) => <TeamManagementView isPlayStaked={true} {...props} />}
        />
        <Route path="/msa/manage-team-unstaked" component={TeamManagementView} />
        <Route path="/msa/manage-team-tournament" component={TeamManagementView} />
      </Switch>
    </>
  )
}

export default MSA
