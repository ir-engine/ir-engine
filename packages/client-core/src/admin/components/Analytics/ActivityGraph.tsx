import React from 'react'

import ApexCharts from 'apexcharts'
import ReactApexChart from 'react-apexcharts'

const ActivityGraph = ({ data /* see data tab */ }) => {
  let maxY = 0
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
        height: 350,
        width: '100%',
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
        min: data[0].data[0] ? data[0].data[0][0] : new Date().setTime(new Date().getTime() - 60000),
        max: data[0].data[0] ? data[0].data[data[0].data.length - 1][0] : new Date().getTime(),
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
          format: 'dd MMM yyy'
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
    <div id="chart-timeline" style={{ height: '30rem' }}>
      <ReactApexChart options={graphData.options} series={graphData.series} height="100%" type="line" width="100%" />
    </div>
  )
}

export default ActivityGraph
