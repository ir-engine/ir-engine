import ApexCharts from 'apexcharts'
import { t } from 'i18next'
import React from 'react'
import ReactApexChart from 'react-apexcharts'

import { useAdminAnalyticsState } from '../../services/AnalyticsService'

const UserGraph = ({ startDate, endDate }) => {
  const analyticsState = useAdminAnalyticsState()

  let maxY = 0
  let minX = new Date(startDate).getTime()
  let maxX = new Date(endDate).getTime()

  const data = [
    {
      name: t('admin:components.analytics.dailyUsers'),
      data: analyticsState.dailyUsers.value.map((item) => {
        return [new Date(item.createdAt).getTime(), item.count]
      })
    },
    {
      name: t('admin:components.analytics.dailyNewUsers'),
      data: analyticsState.dailyNewUsers.value.map((item) => {
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
