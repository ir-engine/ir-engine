import React from 'react'
import ReactApexChart from 'react-apexcharts'
const UserGraph = ({ data /* see data tab */ }) => {
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
        min: data[0].data[0][0],
        max: new Date().getTime(),
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
        max: 10
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
