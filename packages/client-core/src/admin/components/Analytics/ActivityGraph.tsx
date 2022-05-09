import ApexCharts from 'apexcharts'
import React from 'react'
import ReactApexChart from 'react-apexcharts'

const ActivityGraph = ({ data, startDate, endDate }) => {
  let maxY = 0
  let minX = new Date(startDate).getTime()
  let maxX = new Date(endDate).getTime()

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
