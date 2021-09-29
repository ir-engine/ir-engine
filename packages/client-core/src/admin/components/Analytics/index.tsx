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
      height: '50vh',
      width: '99.9%'
    },
    mtopp: {
      marginTop: '20px'
    },
    btn: {
      fontSize: '0.875rem',
      [theme.breakpoints.down('xs')]: {
        fontSize: '0.6rem'
      }
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
      name: 'Active Parties',
      data: dailyUsers
    },
    {
      name: 'Active Locations',
      data: dailyNewUsers
    },
    {
      name: 'Active Instances',
      data: dailyUsers.slice(0, 10)
    },
    {
      name: 'Active Scenes',
      data: dailyNewUsers.slice(0, 10)
    },
    {
      name: 'Instance Users',
      data: dailyUsers.slice(10, 20)
    },
    {
      name: 'Channel Users',
      data: dailyNewUsers.slice(10, 20)
    }
  ]

  const userGraphData = [
    {
      name: 'Daily Users',
      data: dailyUsers
    },
    {
      name: 'Daily New Users',
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
      number: dailyUsers[dailyUsers.length - 1]?.y ?? 0,
      label: 'Users Today'
    },
    {
      number: dailyNewUsers[dailyNewUsers.length - 1]?.y ?? 0,
      label: 'New Users Today'
    }
  ]
  const graphData = graphSelector === 'activity' ? activityGraphData : userGraphData
  return (
    <div>
      <Grid container spacing={3}>
        {data.map((el) => {
          return (
            <Grid item xs={12} sm={6} lg={3} key={el.label}>
              <Card data={el} />
            </Grid>
          )
        })}
      </Grid>
      <div className={classes.mtopp}>
        <Paper className={classes.paper}>
          <ToggleButtonGroup value={graphSelector} exclusive color="primary" aria-label="outlined primary button group">
            <ToggleButton className={classes.btn} value="activity" onClick={() => setGraphSelector('activity')}>
              Activity
            </ToggleButton>
            <ToggleButton className={classes.btn} value="users" onClick={() => setGraphSelector('users')}>
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
