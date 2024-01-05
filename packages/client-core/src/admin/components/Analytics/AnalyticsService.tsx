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

import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'

import LoadingView from '../../../common/components/LoadingView'
import Card from './CardNumber'

import { analyticsPath } from '@etherealengine/common/src/schema.type.module'
import { useFind } from '@etherealengine/engine/src/common/functions/FeathersHooks'

export type AnalyticsQueryTypes =
  | 'activeParties'
  | 'activeInstances'
  | 'activeLocations'
  | 'activeScenes'
  | 'channelUsers'
  | 'instanceUsers'
  | 'dailyUsers'
  | 'dailyNewUsers'

export type AnalyticsQueryMap = Record<AnalyticsQueryTypes, ReturnType<typeof useFind<typeof analyticsPath>>>

const AnalyticsService = ({
  name,
  colors,
  analyticsQueryMap
}: {
  name: AnalyticsQueryTypes
  colors: string[]
  analyticsQueryMap: AnalyticsQueryMap
}) => {
  const { t } = useTranslation()

  const cardData = analyticsQueryMap[name].data.map((item) => {
    return [new Date(item.createdAt).getTime(), item.count]
  })

  return cardData ? (
    <Card
      data={{
        number: cardData.at(-1) ? cardData.at(-1)![1] : 0,
        label: t(`admin:components.analytics.${name}`),
        color1: colors[0],
        color2: colors[1]
      }}
    />
  ) : (
    <LoadingView sx={{ height: '100vh' }} title={t(`admin:components.analytics.loading`)} />
  )
}

export default memo(AnalyticsService)
