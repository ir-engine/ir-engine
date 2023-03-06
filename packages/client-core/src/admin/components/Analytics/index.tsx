import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@etherealengine/ui/src/Box'
import TextField from '@etherealengine/ui/src/TextField'
import ToggleButton from '@etherealengine/ui/src/ToggleButton'
import ToggleButtonGroup from '@etherealengine/ui/src/ToggleButtonGroup'

import DateAdapter from '@mui/lab/AdapterMoment'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import MobileDateTimePicker from '@mui/lab/MobileDateTimePicker'

import { useAuthState } from '../../../user/services/AuthService'
import { useAdminAnalyticsState } from '../../services/AnalyticsService'
import { AdminAnalyticsService } from '../../services/AnalyticsService'
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
  const [refetch, setRefetch] = useState(false)
  // const { t } = useTranslation()
  const [graphSelector, setGraphSelector] = useState('activity')
  const analyticsState = useAdminAnalyticsState()

  const [endDate, setEndDate] = useState(moment())
  const [startDate, setStartDate] = useState(moment().subtract(30, 'days'))

  useEffect(() => {
    if (refetch === true && startDate < endDate) {
      setRefetch(false)
    }
  }, [refetch, startDate, endDate])

  const authState = useAuthState()

  useEffect(() => {
    if (authState.isLoggedIn.value) setRefetch(true)
  }, [authState.isLoggedIn.value])

  const onDateRangeStartChange = (value) => {
    setStartDate(value)
    setRefetch(true)
  }

  const onDateRangeEndChange = (value) => {
    setEndDate(value)
    setRefetch(true)
  }

  const tempStartDate = moment(startDate)
  const minEndDate = moment(tempStartDate.startOf('day').add(1, 'day'))

  return (
    <>
      <div className={styles.dashboardCardsContainer}>
        <AnalyticsService
          name="activeParties"
          colors={['#2c519d', '#31288f']}
          fetch={AdminAnalyticsService.fetchActiveParties}
          data={analyticsState.activeParties.value}
          refetch={refetch}
        />
        <AnalyticsService
          name="activeLocations"
          colors={['#77b2e9', '#458bcc']}
          fetch={AdminAnalyticsService.fetchActiveLocations}
          data={analyticsState.activeLocations.value}
          refetch={refetch}
        />
        <AnalyticsService
          name="activeScenes"
          colors={['#e3b76c', '#df9b26']}
          fetch={AdminAnalyticsService.fetchActiveScenes}
          data={analyticsState.activeScenes.value}
          refetch={refetch}
        />
        <AnalyticsService
          name="activeInstances"
          colors={['#ed7d7e', '#c95859']}
          fetch={AdminAnalyticsService.fetchActiveInstances}
          data={analyticsState.activeInstances.value}
          refetch={refetch}
        />
        <AnalyticsService
          name="dailyUsers"
          colors={['#53a7cd', '#24779c']}
          fetch={AdminAnalyticsService.fetchDailyUsers}
          data={analyticsState.dailyUsers.value}
          refetch={refetch}
        />
        <AnalyticsService
          name="dailyNewUsers"
          colors={['#9771d3', '#6945a1']}
          fetch={AdminAnalyticsService.fetchDailyNewUsers}
          data={analyticsState.dailyNewUsers.value}
          refetch={refetch}
        />
      </div>
      <div className={styles.mt20px}>
        <div className={styles.analyticsPaper}>
          <ToggleButtonGroup value={graphSelector} exclusive color="primary" aria-label="outlined primary button group">
            <ToggleButton
              className={clsx(styles.btn, {
                [styles.btnSelected]: graphSelector === 'activity'
              })}
              value="activity"
              onClick={() => setGraphSelector('activity')}
            >
              Activity
            </ToggleButton>
            <ToggleButton
              className={clsx(styles.btn, {
                [styles.btnSelected]: graphSelector === 'users'
              })}
              value="users"
              onClick={() => setGraphSelector('users')}
            >
              Users
            </ToggleButton>
          </ToggleButtonGroup>
          <div className={styles.datePickerContainer}>
            {/* @ts-ignore */}
            <LocalizationProvider dateAdapter={DateAdapter}>
              <MobileDateTimePicker
                value={startDate}
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
                value={endDate}
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
          {graphSelector === 'activity' && (
            <ActivityGraph startDate={startDate?.toDate()} endDate={endDate?.toDate()} />
          )}
          {graphSelector === 'users' && <UserGraph startDate={startDate?.toDate()} endDate={endDate?.toDate()} />}
        </div>
      </div>
    </>
  )
}

export default Analytics
