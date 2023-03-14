import moment from 'moment'
import React, { memo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import LoadingView from '../../../common/components/LoadingView'
import Card from './CardNumber'

const AnalyticsService = ({ name, colors, fetch, data, refetch }: any) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (refetch === true) {
      fetch(moment().subtract(30, 'days').toDate(), moment()?.toDate())
    }
  }, [refetch, fetch])

  const d = data.map((item) => {
    return [new Date(item.createdAt).getTime(), item.count]
  })

  if (d) {
    return (
      <Card
        data={{
          number: d[d.length - 1] ? d[d.length - 1][1] : 0,
          label: t(`admin:components.analytics.${name}`),
          color1: colors[0],
          color2: colors[1]
        }}
      />
    )
  } else {
    return <LoadingView sx={{ height: '100vh' }} title={t(`admin:components.analytics.loading`)} />
  }
}

export default memo(AnalyticsService)
