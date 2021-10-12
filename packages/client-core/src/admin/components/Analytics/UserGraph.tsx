import React from 'react'
import ReactApexChart from 'react-apexcharts'
const UserGraph = ({ data /* see data tab */ }) => {
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
          text: 'Users',
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
      colors: ['#56b5a6', '#ffbc00']
    }
  })
  return (
    <div id="chart-timeline" style={{ height: '30rem' }}>
      <ReactApexChart options={state.options} series={state.series} type="line" height="100%" width="100%" />
    </div>
  )
}

export default UserGraph
