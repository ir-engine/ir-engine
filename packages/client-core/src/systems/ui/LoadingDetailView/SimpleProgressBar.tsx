/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import * as PropTypes from 'prop-types'
import * as React from 'react'

export type ProgressBarProps = {
  completed: string | number
  bgColor?: string
  baseBgColor?: string
  height?: string
  width?: string
  borderRadius?: string
  margin?: string
  padding?: string
  labelAlignment?: 'left' | 'center' | 'right' | 'outside'
  labelColor?: string
  labelSize?: string
  isLabelVisible?: boolean
  transitionDuration?: string
  transitionTimingFunction?: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  className?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  ariaValuemin?: number
  ariaValuemax?: number
  ariaValuetext?: number | null
  maxCompleted?: number
  customLabel?: string
  animateOnRender?: boolean
  barcontainerClassName?: string
  completedClassName?: string
  labelClassName?: string
  isLooping?: boolean
  loopingBarWidth?: number
  loopingBarSpeed?: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  bgColor,
  completed,
  baseBgColor,
  height,
  width,
  margin,
  padding,
  borderRadius,
  labelAlignment,
  labelColor,
  labelSize,
  isLabelVisible,
  transitionDuration,
  transitionTimingFunction,
  className,
  dir,
  ariaValuemin,
  ariaValuemax,
  ariaValuetext,
  maxCompleted,
  customLabel,
  animateOnRender,
  barcontainerClassName,
  completedClassName,
  labelClassName,
  isLooping,
  loopingBarWidth,
  loopingBarSpeed
}) => {
  const getAlignment = (alignmentOption: ProgressBarProps['labelAlignment']) => {
    if (alignmentOption === 'left') {
      return 'flex-start'
    } else if (alignmentOption === 'center') {
      return 'center'
    } else if (alignmentOption === 'right') {
      return 'flex-end'
    } else {
      return null
    }
  }

  const alignment = getAlignment(labelAlignment)

  const getFillerWidth = (
    maxCompletedValue: ProgressBarProps['maxCompleted'],
    completedValue: ProgressBarProps['completed'],
    isLooping: ProgressBarProps['isLooping'],
    loopingBarWidth: ProgressBarProps['loopingBarWidth']
  ) => {
    if (!maxCompletedValue) return 0
    const ratio = (isLooping ? loopingBarWidth ?? 0 : Number(completedValue)) / maxCompletedValue
    return ratio > 1 ? '100%' : `${ratio * 100}%`
  }

  const fillerWidth = getFillerWidth(maxCompleted, completed, isLooping, loopingBarWidth)

  const [initWidth, setInitWidth] = React.useState<string | 0>(0)
  const [direction, setDirection] = React.useState(1)
  const [position, setPosition] = React.useState(0)

  const containerStyles: React.CSSProperties = {
    height: height,
    backgroundColor: baseBgColor,
    borderRadius: borderRadius,
    padding: padding,
    width: width,
    margin: margin
  }

  const fillerStyles: React.CSSProperties = {
    height: height,
    width: animateOnRender ? initWidth : fillerWidth,
    backgroundColor: bgColor,
    transition: `width ${transitionDuration || '1s'} ${transitionTimingFunction || 'ease-in-out'}`,
    borderRadius: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: labelAlignment !== 'outside' && alignment ? alignment : 'normal'
  }
  const loopingFillerStyles: React.CSSProperties = {
    height,
    width: fillerWidth,
    backgroundColor: bgColor,
    position: 'relative',
    left: `${position}%`
  }
  const labelStyles: React.CSSProperties = {
    padding: labelAlignment === 'outside' ? '0 0 0 5px' : '5px',
    color: labelColor,
    fontWeight: 'bold',
    fontSize: labelSize,
    display: !isLabelVisible ? 'none' : 'initial'
  }

  const outsideStyles = {
    display: labelAlignment === 'outside' ? 'flex' : 'initial',
    alignItems: labelAlignment === 'outside' ? 'center' : 'initial'
  }

  const completedStr = typeof completed === 'number' ? `${completed}%` : `${completed}`

  const labelStr = customLabel ? customLabel : completedStr

  React.useEffect(() => {
    if (animateOnRender) {
      requestAnimationFrame(() => setInitWidth(fillerWidth))
    }
  }, [fillerWidth, animateOnRender])
  React.useEffect(() => {
    if (!isLooping) {
      setPosition(0)
      return
    }
    let animationFrameId
    const animate = () => {
      setPosition((prevPosition) => {
        const newPosition = prevPosition + (direction ?? 1) * (loopingBarSpeed ?? 1)
        const maxPosition = maxCompleted ?? 0
        const maxPositionWithBarWidth = maxPosition - (loopingBarWidth ?? 0)
        if (newPosition >= maxPositionWithBarWidth || newPosition <= 0) {
          setDirection(-direction) // Reverse direction
        }
        return newPosition
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isLooping, direction, loopingBarWidth])
  return (
    <div
      style={className ? undefined : outsideStyles}
      className={className}
      dir={dir}
      role="progressbar"
      aria-valuenow={parseFloat(labelStr)}
      aria-valuemin={ariaValuemin}
      aria-valuemax={ariaValuemax}
      aria-valuetext={`${ariaValuetext === null ? labelStr : ariaValuetext}`}
    >
      <div style={barcontainerClassName ? undefined : containerStyles} className={barcontainerClassName}>
        <div
          style={completedClassName ? undefined : isLooping ? loopingFillerStyles : fillerStyles}
          className={completedClassName}
        >
          {labelAlignment !== 'outside' && (
            <span style={labelClassName ? undefined : labelStyles} className={labelClassName}>
              {labelStr}
            </span>
          )}
        </div>
      </div>
      {labelAlignment === 'outside' && (
        <span style={labelClassName ? undefined : labelStyles} className={labelClassName}>
          {labelStr}
        </span>
      )}
    </div>
  )
}

ProgressBar.propTypes = {
  completed: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bgColor: PropTypes.string,
  baseBgColor: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string,
  borderRadius: PropTypes.string,
  margin: PropTypes.string,
  padding: PropTypes.string,
  labelAlignment: PropTypes.oneOf(['left', 'center', 'right', 'outside']),
  labelColor: PropTypes.string,
  labelSize: PropTypes.string,
  isLabelVisible: PropTypes.bool,
  className: PropTypes.string,
  dir: PropTypes.oneOf(['rtl', 'ltr', 'auto']),
  maxCompleted: PropTypes.number,
  customLabel: PropTypes.string,
  animateOnRender: PropTypes.bool,
  barcontainerClassName: PropTypes.string,
  completedClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  isLooping: PropTypes.bool,
  loopingBarWidth: PropTypes.number,
  loopingBarSpeed: PropTypes.number
}

ProgressBar.defaultProps = {
  bgColor: '#6a1b9a',
  height: '20px',
  width: '100%',
  borderRadius: '50px',
  labelAlignment: 'right',
  baseBgColor: '#e0e0de',
  labelColor: '#fff',
  labelSize: '15px',
  isLabelVisible: true,
  dir: 'ltr',
  ariaValuemin: 0,
  ariaValuemax: 100,
  ariaValuetext: null,
  maxCompleted: 100,
  animateOnRender: false,
  isLooping: false,
  loopingBarWidth: 0,
  loopingBarSpeed: 0.2
}

export default ProgressBar
