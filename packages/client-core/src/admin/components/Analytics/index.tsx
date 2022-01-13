import React, { useEffect, useState } from 'react'
import Card from './CardNumber'

import clsx from 'clsx'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { Theme } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import createStyles from '@mui/styles/createStyles'
import Paper from '@mui/material/Paper'
import UserGraph from './UserGraph'
import ActivityGraph from './ActivityGraph'
import { useAuthState } from '../../../user/services/AuthService'
import { useAnalyticsState } from '../../services/AnalyticsService'
import { AnalyticsService } from '../../services/AnalyticsService'

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
      width: '99.9%',
      backgroundColor: '#323845'
    },
    mtopp: {
      marginTop: '20px'
    },
    btn: {
      color: 'white',
      borderColor: 'white',
      fontSize: '0.875rem',
      [theme.breakpoints.down('md')]: {
        fontSize: '0.6rem'
      }
    },
    btnSelected: {
      color: 'white !important',
      borderColor: 'white',
      backgroundColor: '#0000004d !important'
    },
    dashboardCardsContainer: {
      display: 'grid',
      gridGap: '10px',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      ['@media (max-width: 900px)']: {
        gridTemplateColumns: '1fr 1fr 1fr'
      },
      ['@media (max-width: 700px)']: {
        gridTemplateColumns: '1fr 1fr'
      },
      ['@media (max-width: 500px)']: {
        gridTemplateColumns: '1fr'
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
      AnalyticsService.fetchActiveParties()
      AnalyticsService.fetchInstanceUsers()
      AnalyticsService.fetchChannelUsers()
      AnalyticsService.fetchActiveLocations()
      AnalyticsService.fetchActiveScenes()
      AnalyticsService.fetchActiveInstances()
      AnalyticsService.fetchDailyUsers()
      AnalyticsService.fetchDailyNewUsers()
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
      label: 'Active Parties',
      color1: '#2c519d',
      color2: '#31288f'
    },
    {
      number: activeLocations[activeLocations.length - 1] ? activeLocations[activeLocations.length - 1][1] : 0,
      label: 'Active Locations',
      color1: '#77b2e9',
      color2: '#458bcc'
    },
    {
      number: activeScenes[activeScenes.length - 1] ? activeScenes[activeScenes.length - 1][1] : 0,
      label: 'Active Scenes',
      color1: '#e3b76c',
      color2: '#df9b26'
    },
    {
      number: activeInstances[activeInstances.length - 1] ? activeInstances[activeInstances.length - 1][1] : 0,
      label: 'Active Instances',
      color1: '#ed7d7e',
      color2: '#c95859'
    },
    {
      number: dailyUsers[dailyUsers.length - 1] ? dailyUsers[dailyUsers.length - 1][1] : 0,
      label: 'Users Today',
      color1: '#53a7cd',
      color2: '#24779c'
    },
    {
      number: dailyNewUsers[dailyNewUsers.length - 1] ? dailyNewUsers[dailyNewUsers.length - 1][1] : 0,
      label: 'New Users Today',
      color1: '#9771d3',
      color2: '#6945a1'
    }
  ]

  return (
    <>
      <div className={classes.dashboardCardsContainer}>
        {data.map((el) => {
          return <Card key={el.label} data={el} />
        })}
      </div>
      <div className={classes.mtopp}>
        <Paper className={classes.paper}>
          <ToggleButtonGroup value={graphSelector} exclusive color="primary" aria-label="outlined primary button group">
            <ToggleButton
              className={clsx(classes.btn, {
                [classes.btnSelected]: graphSelector === 'activity'
              })}
              value="activity"
              onClick={() => setGraphSelector('activity')}
            >
              Activity
            </ToggleButton>
            <ToggleButton
              className={clsx(classes.btn, {
                [classes.btnSelected]: graphSelector === 'users'
              })}
              value="users"
              onClick={() => setGraphSelector('users')}
            >
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
    </>
  )
}

export default Analytics
