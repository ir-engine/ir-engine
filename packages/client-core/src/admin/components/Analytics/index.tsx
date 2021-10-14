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
import { useAnalyticsState } from '../../reducers/admin/analytics/AnalyticsState'
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
      height: '35rem',
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
  let isDataAvailable = false
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
      data: activeParties
    },
    {
      name: 'Active Locations',
      data: activeLocations
    },
    {
      name: 'Active Instances',
      data: activeInstances
    },
    {
      name: 'Active Scenes',
      data: activeScenes
    },
    {
      name: 'Instance Users',
      data: instanceUsers
    },
    {
      name: 'Channel Users',
      data: channelUsers
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

  if (
    activityGraphData[0].data.length &&
    activityGraphData[1].data.length &&
    activityGraphData[2].data.length &&
    activityGraphData[3].data.length &&
    activityGraphData[4].data.length &&
    activityGraphData[5].data.length
  )
    isDataAvailable = true

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
      number: activeParties[activeParties.length - 1] ? activeParties[activeParties.length - 1][1] : 0,
      label: 'Active Parties'
    },
    {
      number: activeLocations[activeLocations.length - 1] ? activeLocations[activeLocations.length - 1][1] : 0,
      label: 'Active Locations'
    },
    {
      number: activeScenes[activeScenes.length - 1] ? activeScenes[activeScenes.length - 1][1] : 0,
      label: 'Active Scenes'
    },
    {
      number: activeInstances[activeInstances.length - 1] ? activeInstances[activeInstances.length - 1][1] : 0,
      label: 'Active Instances'
    },
    {
      number: dailyUsers[dailyUsers.length - 1] ? dailyUsers[dailyUsers.length - 1][1] : 0,
      label: 'Users Today'
    },
    {
      number: dailyNewUsers[dailyNewUsers.length - 1] ? dailyNewUsers[dailyNewUsers.length - 1][1] : 0,
      label: 'New Users Today'
    }
  ]

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
          {graphSelector === 'activity' && isDataAvailable && <ActivityGraph data={activityGraphData} />}
          {graphSelector === 'users' && <UserGraph data={userGraphData} />}
        </Paper>
      </div>
      {/*<div className={classes.mtopp}>*/}
      {/*  <ApiLinks />*/}
      {/*</div>*/}
    </div>
  )
}

export default Analytics
