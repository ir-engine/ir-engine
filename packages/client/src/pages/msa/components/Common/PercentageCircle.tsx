import styles from './Common.module.scss'
import React from 'react'

const PercentageCircle = (props: any): any => {
  const percentage = props.percentage

  const sqSize = 100
  const viewBoxSqSize = 110
  const strokeWidth = 5
  const shadowStrokeWidth = 10
  // SVG centers the stroke width on the radius, subtract out so circle fits in square
  const radius = (sqSize - strokeWidth * 2) / 2
  const shadowRadius = (sqSize - strokeWidth - shadowStrokeWidth) / 2
  // Enclose circle in a circumscribing square
  const viewBox = `0 0 ${viewBoxSqSize} ${viewBoxSqSize}`
  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2
  const shadowDashArray = shadowRadius * Math.PI * 2
  // Scale 100% coverage overlay with the actual percent
  const dashOffset = dashArray - (dashArray * percentage) / 100
  const shadowDashOffset = shadowDashArray - shadowDashArray

  return (
    <svg width={viewBoxSqSize} height={viewBoxSqSize} viewBox={viewBox}>
      <circle
        className={styles.circleProgressShadow}
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={shadowRadius}
        strokeWidth={`${shadowStrokeWidth}px`}
        // Start progress marker at 12 O'Clock
        transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
        style={{
          strokeDasharray: shadowDashArray,
          strokeDashoffset: shadowDashOffset
        }}
      />

      <circle
        className={styles.circleProgress}
        cx={sqSize / 2}
        cy={sqSize / 2}
        r={radius - 2}
        strokeWidth={`${strokeWidth}px`}
        // Start progress marker at 12 O'Clock
        transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: dashOffset
        }}
      />

      <text className={styles.circleText} x="45%" y="60%" textAnchor="middle">
        {`${percentage}`}
      </text>
    </svg>
  )
}

export default PercentageCircle
