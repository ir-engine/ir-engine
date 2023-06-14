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

import ApexCharts from 'apexcharts'
import React from 'react'
import ReactApexChart from 'react-apexcharts'
import { useTranslation } from 'react-i18next'

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { AdminAnalyticsState } from '../../services/AnalyticsService'

const ActivityGraph = ({ startDate, endDate }) => {
  const analyticsState = useHookstate(getMutableState(AdminAnalyticsState))
  const { t } = useTranslation()

  let maxY = 0
  let minX = new Date(startDate).getTime()
  let maxX = new Date(endDate).getTime()

  const data = [
    {
      name: t('admin:components.analytics.activeParties'),
      data: analyticsState.activeParties.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    },
    {
      name: t('admin:components.analytics.activeLocations'),
      data: analyticsState.activeLocations.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    },
    {
      name: t('admin:components.analytics.activeInstances'),
      data: analyticsState.activeInstances.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    },
    {
      name: t('admin:components.analytics.activeScenes'),
      data: analyticsState.activeScenes.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    },
    {
      name: t('admin:components.analytics.instanceUsers'),
      data: analyticsState.instanceUsers.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    },
    {
      name: t('admin:components.analytics.channelUsers'),
      data: analyticsState.channelUsers.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    }
  ]

  if (data) {
    for (let analytic of data) {
      if (analytic) {
        for (let item of analytic.data) {
          if (maxY < item[1]) {
            maxY = item[1]
          }
        }
      }
    }
  }

  const roundPower = Math.pow(10, Math.floor(Math.log10(maxY)))
  maxY = Math.ceil(maxY / roundPower) * roundPower
  const graphData = {
    series: data,
    options: {
      chart: {
        id: 'area-datetime',
        type: 'area',
        height: '100%',
        width: '100%',
        zoom: {
          autoScaleYaxis: true
        },
        background: 'var(--panelBackground)',
        toolbar: {
          tools: {
            zoomin: false,
            zoomout: false,
            zoom: false,
            pan: false,
            show: false,
            reset: false
          }
        }
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ['white']
        }
      },
      legend: {
        labels: {
          colors: ['white']
        }
      },
      markers: {
        size: 0,
        style: 'hollow'
      },
      xaxis: {
        type: 'datetime',
        min: minX,
        max: maxX,
        tickAmount: 6,
        labels: {
          style: {
            colors: 'white'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Activities',
          style: {
            fontSize: '18px',
            fontWeight: '400',
            color: 'white'
          }
        },
        min: 0,
        max: maxY,
        labels: {
          style: {
            colors: ['white']
          }
        }
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy'
        }
      },
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      title: {
        text: '',
        align: 'center',
        margin: 20,
        offsetY: 20,
        style: {
          fontSize: '25px'
        }
      },
      theme: {
        palette: 'palette1'
      }
    } as ApexCharts.ApexOptions
  }

  return (
    <div id="chart-timeline" style={{ height: '25rem' }}>
      <ReactApexChart options={graphData.options} series={graphData.series} height="100%" type="line" width="100%" />
    </div>
  )
}

export default ActivityGraph
