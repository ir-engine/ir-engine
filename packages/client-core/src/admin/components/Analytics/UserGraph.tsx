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
import { t } from 'i18next'
import React from 'react'
import ReactApexChart from 'react-apexcharts'

import { AnalyticsQueryMap, AnalyticsQueryTypes } from './AnalyticsService'

const UserGraph = ({
  analyticsNames,
  startDate,
  endDate,
  analyticsQueryMap
}: {
  analyticsNames: AnalyticsQueryTypes[]
  startDate: Date
  endDate: Date
  analyticsQueryMap: AnalyticsQueryMap
}) => {
  let maxY = 0
  const minX = new Date(startDate).getTime()
  const maxX = new Date(endDate).getTime()

  const data = analyticsNames.map((analyticName) => ({
    name: t(`admin:components.analytics.${analyticName}`),
    data: analyticsQueryMap[analyticName].data.map((item) => [new Date(item.createdAt).getTime(), item.count])
  }))

  data.forEach((d) => {
    d.data.forEach((item) => (maxY = Math.max(item[1], maxY)))
  })

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
        background: 'var(--panelBackground)',
        zoom: {
          autoScaleYaxis: true
        },
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
          text: 'Users',
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
      fill: {
        colors: ['#F44336']
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
      <ReactApexChart options={graphData.options} series={graphData.series} type="line" height="100%" width="100%" />
    </div>
  )
}

export default UserGraph
