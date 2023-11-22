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
import React from 'react'

import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import ToggleButton from '@etherealengine/ui/src/primitives/mui/ToggleButton'
import ToggleButtonGroup from '@etherealengine/ui/src/primitives/mui/ToggleButtonGroup'

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'

import styles from '../../styles/admin.module.scss'
import ActivityGraph from './ActivityGraph'

import './index.scss'

import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'
import { analyticsPath } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import { useTranslation } from 'react-i18next'
import AnalyticsService, { AnalyticsQueryMap, AnalyticsQueryTypes } from './AnalyticsService'
import UserGraph from './UserGraph'

const allAnalyticsQueries = [
  'activeParties',
  'activeInstances',
  'activeLocations',
  'activeScenes',
  'channelUsers',
  'instanceUsers',
  'dailyUsers',
  'dailyNewUsers'
]

const analyticsServiceQueries: { type: AnalyticsQueryTypes; colors: [string, string] }[] = [
  { type: 'activeParties', colors: ['#2c519d', '#31288f'] },
  { type: 'activeLocations', colors: ['#77b2e9', '#458bcc'] },
  { type: 'activeScenes', colors: ['#e3b76c', '#df9b26'] },
  { type: 'activeInstances', colors: ['#ed7d7e', '#c95859'] },
  { type: 'dailyUsers', colors: ['#53a7cd', '#24779c'] },
  { type: 'dailyNewUsers', colors: ['#9771d3', '#6945a1'] }
]

const userGraphAnalyticsQueries: AnalyticsQueryTypes[] = ['dailyUsers', 'dailyNewUsers']
const activityGraphAnalyticsQueries: AnalyticsQueryTypes[] = [
  'activeParties',
  'activeLocations',
  'activeInstances',
  'activeScenes',
  'instanceUsers',
  'channelUsers'
]

const Analytics = () => {
  const { t } = useTranslation()
  const graphSelector = useHookstate('activity')
  const startDate = useHookstate(moment().subtract(30, 'days'))
  const endDate = useHookstate(moment())

  const analyticsQueryMap = {} as AnalyticsQueryMap
  allAnalyticsQueries.forEach((query) => {
    analyticsQueryMap[query] = useFind(analyticsPath, {
      query: { type: query, $sort: { createdAt: -1 }, createdAt: { $gt: startDate.value, $lt: endDate.value } }
    })
  })

  const minEndDate = moment(moment(startDate.value).startOf('day').add(1, 'day'))

  return (
    <>
      <div className={styles.dashboardCardsContainer}>
        {analyticsServiceQueries.map((query, index) => (
          <AnalyticsService
            key={query.type + index}
            name={query.type}
            colors={query.colors!}
            analyticsQueryMap={analyticsQueryMap}
          />
        ))}
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
              {t('admin:components.analytics.activity')}
            </ToggleButton>
            <ToggleButton
              className={clsx(styles.btn, {
                [styles.btnSelected]: graphSelector.value === 'users'
              })}
              value="users"
              onClick={() => graphSelector.set('users')}
            >
              {t('admin:components.analytics.users')}
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
                onChange={startDate.set}
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
                onChange={endDate.set}
              />
            </LocalizationProvider>
          </div>
          {graphSelector.value === 'activity' && (
            <ActivityGraph
              startDate={startDate?.value?.toDate()}
              endDate={endDate?.value?.toDate()}
              analyticsQueryMap={analyticsQueryMap}
              analyticsNames={activityGraphAnalyticsQueries}
            />
          )}
          {graphSelector.value === 'users' && (
            <UserGraph
              startDate={startDate?.value?.toDate()}
              endDate={endDate?.value?.toDate()}
              analyticsQueryMap={analyticsQueryMap}
              analyticsNames={userGraphAnalyticsQueries}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default Analytics
