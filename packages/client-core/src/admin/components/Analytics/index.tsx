import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect } from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import TextField from '@etherealengine/ui/src/primitives/mui/TextField'
import ToggleButton from '@etherealengine/ui/src/primitives/mui/ToggleButton'
import ToggleButtonGroup from '@etherealengine/ui/src/primitives/mui/ToggleButtonGroup'

import DateAdapter from '@mui/lab/AdapterMoment'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import MobileDateTimePicker from '@mui/lab/MobileDateTimePicker'

import { AuthState } from '../../../user/services/AuthService'
import { AdminAnalyticsService, AdminAnalyticsState } from '../../services/AnalyticsService'
import styles from '../../styles/admin.module.scss'
import ActivityGraph from './ActivityGraph'

import './index.scss'

import AnalyticsService from './AnalyticsService'
import UserGraph from './UserGraph'

/**
 * Function for analytics on admin dashboard
 *
 * @returns @ReactDomElements
 */

const Analytics = () => {
  const refetch = useHookstate(false)
  const graphSelector = useHookstate('activity')
  const analyticsState = useHookstate(getMutableState(AdminAnalyticsState))

  const endDate = useHookstate(moment())
  const startDate = useHookstate(moment().subtract(30, 'days'))

  useEffect(() => {
    if (refetch.value && startDate.value < endDate.value) {
      refetch.set(false)
    }
  }, [refetch.value, startDate.value, endDate.value])

  const authState = useHookstate(getMutableState(AuthState))

  useEffect(() => {
    if (authState.isLoggedIn.value) refetch.set(true)
  }, [authState.isLoggedIn.value])

  const onDateRangeStartChange = (value) => {
    startDate.set(value)
    refetch.set(true)
  }

  const onDateRangeEndChange = (value) => {
    endDate.set(value)
    refetch.set(true)
  }

  const tempStartDate = moment(startDate.value)
  const minEndDate = moment(tempStartDate.startOf('day').add(1, 'day'))

  return (
    <>
      <div className={styles.dashboardCardsContainer}>
        <AnalyticsService
          name="activeParties"
          colors={['#2c519d', '#31288f']}
          fetch={AdminAnalyticsService.fetchActiveParties}
          data={analyticsState.activeParties.value}
          refetch={refetch.value}
        />
        <AnalyticsService
          name="activeLocations"
          colors={['#77b2e9', '#458bcc']}
          fetch={AdminAnalyticsService.fetchActiveLocations}
          data={analyticsState.activeLocations.value}
          refetch={refetch.value}
        />
        <AnalyticsService
          name="activeScenes"
          colors={['#e3b76c', '#df9b26']}
          fetch={AdminAnalyticsService.fetchActiveScenes}
          data={analyticsState.activeScenes.value}
          refetch={refetch.value}
        />
        <AnalyticsService
          name="activeInstances"
          colors={['#ed7d7e', '#c95859']}
          fetch={AdminAnalyticsService.fetchActiveInstances}
          data={analyticsState.activeInstances.value}
          refetch={refetch.value}
        />
        <AnalyticsService
          name="dailyUsers"
          colors={['#53a7cd', '#24779c']}
          fetch={AdminAnalyticsService.fetchDailyUsers}
          data={analyticsState.dailyUsers.value}
          refetch={refetch.value}
        />
        <AnalyticsService
          name="dailyNewUsers"
          colors={['#9771d3', '#6945a1']}
          fetch={AdminAnalyticsService.fetchDailyNewUsers}
          data={analyticsState.dailyNewUsers.value}
          refetch={refetch.value}
        />
      </div>
      <div className={styles.mt20px}>
        <div className={styles.analyticsPaper}>
          <ToggleButtonGroup
            value={graphSelector.value}
            exclusive
            color="primary"
            aria-label="outlined primary button group"
          >
            <ToggleButton
              className={clsx(styles.btn, {
                [styles.btnSelected]: graphSelector.value === 'activity'
              })}
              value="activity"
              onClick={() => graphSelector.set('activity')}
            >
              Activity
            </ToggleButton>
            <ToggleButton
              className={clsx(styles.btn, {
                [styles.btnSelected]: graphSelector.value === 'users'
              })}
              value="users"
              onClick={() => graphSelector.set('users')}
            >
              Users
            </ToggleButton>
          </ToggleButtonGroup>
          <div className={styles.datePickerContainer}>
            {/* @ts-ignore */}
            <LocalizationProvider dateAdapter={DateAdapter}>
              <MobileDateTimePicker
                value={startDate.value}
                DialogProps={{
                  PaperProps: {
                    className: styles.dateTimePickerDialog
                  }
                }}
                onChange={(value) => onDateRangeStartChange(value)}
                renderInput={(params) => <TextField {...params} />}
              />
              <Box sx={{ mx: 2 }}> to </Box>
              <MobileDateTimePicker
                value={endDate.value}
                DialogProps={{
                  PaperProps: {
                    className: styles.dateTimePickerDialog
                  }
                }}
                minDateTime={minEndDate}
                onChange={(value) => onDateRangeEndChange(value)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </div>
          {graphSelector.value === 'activity' && (
            <ActivityGraph startDate={startDate?.value?.toDate()} endDate={endDate?.value?.toDate()} />
          )}
          {graphSelector.value === 'users' && (
            <UserGraph startDate={startDate?.value?.toDate()} endDate={endDate?.value?.toDate()} />
          )}
        </div>
      </div>
    </>
  )
}

export default Analytics
