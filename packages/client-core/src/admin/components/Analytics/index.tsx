/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import clsx from 'clsx'
import moment from 'moment'
import React, { useEffect } from 'react'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import ToggleButton from '@etherealengine/ui/src/primitives/mui/ToggleButton'
import ToggleButtonGroup from '@etherealengine/ui/src/primitives/mui/ToggleButtonGroup'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'

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
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <MobileDateTimePicker
                value={startDate.value}
                slotProps={{
                  dialog: {
                    PaperProps: {
                      className: styles.dateTimePickerDialog
                    }
                  }
                }}
                onChange={(value) => onDateRangeStartChange(value)}
              />
              <Box sx={{ mx: 2 }}> to </Box>
              <MobileDateTimePicker
                value={endDate.value}
                slotProps={{
                  dialog: {
                    PaperProps: {
                      className: styles.dateTimePickerDialog
                    }
                  }
                }}
                minDateTime={minEndDate}
                onChange={(value) => onDateRangeEndChange(value)}
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
