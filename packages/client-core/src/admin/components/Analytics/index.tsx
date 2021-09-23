import React, { useEffect, useState } from 'react'
import Card from './CardNumber'
import Grid from '@material-ui/core/Grid'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import UserGraph from './UserGraph'
import ActivityGraph from './ActivityGraph'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { useAuthState } from '../../../user/reducers/auth/AuthState'
import { useAnalyticsState } from '@xrengine/client-core/src/admin/reducers/admin/analytics/AnalyticsState'
import { AnalyticsService } from '../../reducers/admin/analytics/AnalyticsService'

interface Props {
  adminGroupState?: any
  fetchAdminGroup?: any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height: '40vh'
      // maxWidth: "1500px"
    },
    mtopp: {
      marginTop: '20px'
    }
  })
)

/**
 * Function for analytics on admin dashboard
 *
 * @returns @ReactDomElements
 * @author Kevin KIMENYI <kimenyikevin@gmail.com>
 */

const Analytics = (props: Props) => {
  const dispatch = useDispatch()
  const [refetch, setRefetch] = useState(false)
  const [graphSelector, setGraphSelector] = useState('activity')
  const analyticsState = useAnalyticsState()

  const activeLocations = analyticsState.activeLocations.value
  const activeParties = analyticsState.activeParties.value
  const activeScenes = analyticsState.activeScenes.value
  const activeInstances = analyticsState.activeInstances.value
  const instanceUsers = analyticsState.instanceUsers.value
  const channelUsers = analyticsState.channelUsers.value
  const dailyUsers = analyticsState.dailyUsers.value
  const dailyNewUsers = analyticsState.dailyNewUsers.value

  const fetchTick = () => {
    setTimeout(() => {
      setRefetch(true)
      fetchTick()
    }, 5000)
  }

  const activityGraphData = [
    {
      id: 'Active Parties',
      color: 'hsl(77, 70%, 20%)',
      data: activeParties
    },
    {
      id: 'Active Locations',
      color: 'hsl(128, 20%, 80%)',
      data: activeLocations
    },
    {
      id: 'Active Instances',
      color: 'hsl(50, 20%, 80%)',
      data: activeInstances
    },
    {
      id: 'Active Scenes',
      color: 'hsl(0, 20%, 80%)',
      data: activeScenes
    },
    {
      id: 'Instance Users',
      color: 'hsl(212, 20%, 80%)',
      data: instanceUsers
    },
    {
      id: 'Channel Users',
      color: 'hsl(250, 20%, 80%)',
      data: channelUsers
    }
  ]

  const userGraphData = [
    {
      id: 'Daily Users',
      color: 'hsl(77, 70%, 20%)',
      data: dailyUsers
    },
    {
      id: 'Daily New Users',
      color: 'hsl(250, 10%, 20%)',
      data: dailyNewUsers
    }
  ]

  useEffect(() => {
    if (refetch === true) {
      dispatch(AnalyticsService.fetchActiveParties())
      dispatch(AnalyticsService.fetchInstanceUsers())
      dispatch(AnalyticsService.fetchChannelUsers())
      dispatch(AnalyticsService.fetchActiveLocations())
      dispatch(AnalyticsService.fetchActiveScenes())
      dispatch(AnalyticsService.fetchActiveInstances())
      dispatch(AnalyticsService.fetchDailyUsers())
      dispatch(AnalyticsService.fetchDailyNewUsers())
    }
    setRefetch(false)
  }, [refetch])

  const authState = useAuthState()

  useEffect(() => {
    if (authState.isLoggedIn.value) setRefetch(true)
  }, [authState.isLoggedIn.value])

  useEffect(() => {
    fetchTick()
  }, [])

  const classes = useStyles()
  const data = [
    {
      number: activeParties[activeParties.length - 1]?.y.toLocaleString(undefined, { notation: 'compact' }) ?? 0,
      label: 'Active Parties'
    },
    {
      number: activeLocations[activeLocations.length - 1]?.y.toLocaleString(undefined, { notation: 'compact' }) ?? 0,
      label: 'Active Locations'
    },
    {
      number: activeScenes[activeScenes.length - 1]?.y.toLocaleString(undefined, { notation: 'compact' }) ?? 0,
      label: 'Active Scenes'
    },
    {
      number: activeInstances[activeInstances.length - 1]?.y.toLocaleString(undefined, { notation: 'compact' }) ?? 0,
      label: 'Active Instances'
    },
    {
      number: dailyUsers[dailyUsers.length - 1]?.y.toLocaleString(undefined, { notation: 'compact' }) ?? 0,
      label: 'Users Today'
    },
    {
      number: dailyNewUsers[dailyNewUsers.length - 1]?.y.toLocaleString(undefined, { notation: 'compact' }) ?? 0,
      label: 'New Users Today'
    }
  ]
  const graphData = graphSelector === 'activity' ? activityGraphData : userGraphData

  return (
    <div>
      <Grid container spacing={3}>
        {data.map((el) => {
          return (
            <Grid item xs={3} key={el.label}>
              <Card data={el} />
            </Grid>
          )
        })}
      </Grid>
      <div className={classes.mtopp}>
        <Paper className={classes.paper}>
          <ToggleButtonGroup value={graphSelector} exclusive color="primary" aria-label="outlined primary button group">
            <ToggleButton value="activity" onClick={() => setGraphSelector('activity')}>
              Activity
            </ToggleButton>
            <ToggleButton value="users" onClick={() => setGraphSelector('users')}>
              Users
            </ToggleButton>
          </ToggleButtonGroup>
          {graphSelector === 'users' && <UserGraph data={graphData} />}
          {graphSelector === 'activity' && <ActivityGraph data={graphData} />}
        </Paper>
      </div>
      {/*<div className={classes.mtopp}>*/}
      {/*  <ApiLinks />*/}
      {/*</div>*/}
    </div>
  )
}

export default Analytics
