import { max } from 'lodash'
import React from 'react'
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
  const [state, setState] = React.useState({
    series: data,
    options: {
      chart: {
        id: 'area-datetime',
        type: 'area',
        height: 350,
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
        enabled: false
      },
      markers: {
        size: 0,
        style: 'hollow'
      },
      xaxis: {
        type: 'datetime',
        min: data[0].data[0] ? data[0].data[0][0] : new Date().setTime(new Date().getTime() - 60000),
        max: data[0].data[0] ? data[0].data[data[0].data.length - 1][0] : new Date().getTime(),
        tickAmount: 6
      },
      yaxis: {
        title: {
          text: 'Activities',
          style: {
            fontSize: '18px',
            fontWeight: '400'
          }
        },
        min: 0,
        max: maxY
      },
      tooltip: {
        x: {
          format: 'dd MMM yyy'
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
      colors: ['#42570f', '#c2d6c5', '#d6d3c2', '#d6c2c2', '#c2cbd6', '	#c5c2d6']
    }
  })
  return (
    <div id="chart-timeline" style={{ height: '30rem' }}>
      <ReactApexChart options={state.options} series={state.series} height="100%" type="line" width="100%" />
    </div>
  )
}

export default ActivityGraph
