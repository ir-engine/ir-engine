import React from 'react'
import { ResponsiveLine } from '@nivo/line'
const ActivityGraph = ({ data /* see data tab */ }) => {
  return (
    //@ts-ignore
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 100, left: 60 }}
      xScale={{ type: 'time', reverse: true }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Datetime',
        legendOffset: 36,
        legendPosition: 'middle',
        format: '%Y-%m-%d, %I:%M:%S'
      }}
      axisLeft={{
        orient: 'left',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        tickValues: data
          .find((series) => series.id === 'Active Locations')
          .data?.map((item) => item.y)
          .filter((value, index, self) => self.indexOf(value) === index),
        legend: 'count',
        legendOffset: -40,
        legendPosition: 'middle'
      }}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1
              }
            }
          ]
        }
      ]}
    />
  )
}

export default ActivityGraph
