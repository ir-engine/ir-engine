import React from 'react'
import ReactApexChart from 'react-apexcharts'

const ActivityGraph = ({ data /* see data tab */ }) => {
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
        min: data[0].data[0] ? data[0].data[0][0] : new Date().setMonth(new Date().getMonth() - 1),
        max: new Date().getTime(),
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
        max: 10
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
    <div id="chart-timeline">
      <ReactApexChart options={state.options} series={state.series} type="line" height={380} width="100%" />
    </div>
  )
}

export default ActivityGraph
