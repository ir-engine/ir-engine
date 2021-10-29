import React, { useRef, ReactNode } from 'react'
import Portal from '../layout/Portal'
import { getStepSize, toPrecision } from '../../functions/utils'
import styled from 'styled-components'
import { ArrowsAltH } from '@styled-icons/fa-solid/ArrowsAltH'
import Overlay from '../layout/Overlay'
import { clamp } from '@xrengine/engine/src/common/functions/MathLerpFunctions'
import {} from 'react'
import { useState } from 'react'
import { useEffect } from 'react'

/**
 *
 * @author Robert Long
 */
const ScrubberContainer = (styled as any).div`
  cursor: ew-resize;
  user-select: none;
`

/**
 *
 * @author Robert Long
 */
const Cursor = (styled as any)(ArrowsAltH).attrs(({ x, y }) => ({
  style: {
    transform: `translate(${x}px,${y}px)`
  }
}))`
  position: absolute;
  width: 20px;

  path {
    stroke: white;
    strokeWidth: 20px;
    fill: black;
  }
`

type ScrubberProp = {
  tag?: any
  children?: ReactNode
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  sensitivity?: number
  min?: number
  max?: number
  precision?: number
  convertFrom?: any
  convertTo?: any
  value?: any
  onChange?: Function
  onCommit?: Function
}

/**
 *
 * @author Robert Long
 */
const Scrubber = (props: ScrubberProp) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startValue, setStartValue] = useState(null)
  const [delta, setDelta] = useState(null)
  const [mouseX, setMouseX] = useState(null)
  const [mouseY, setMouseY] = useState(null)
  const scrubberEl = useRef(null)

  const handleMouseMove = (event) => {
    const { smallStep, mediumStep, largeStep, sensitivity, min, max, precision, convertTo, onChange } = props

    if (isDragging) {
      const mX = mouseX + event.movementX
      const mY = mouseY + event.movementY
      const nextDelta = delta + event.movementX
      const stepSize = getStepSize(event, smallStep, mediumStep, largeStep)
      const nextValue = startValue + Math.round(nextDelta / sensitivity) * stepSize
      const clampedValue = clamp(nextValue, min, max)
      const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
      const finalValue = convertTo(roundedValue)
      onChange(finalValue)

      setDelta(nextDelta)
      setMouseX(mX)
      setMouseY(mY)
    }
  }

  const handleMouseUp = () => {
    const { onCommit, onChange, value } = props

    if (isDragging) {
      setIsDragging(false)
      setStartValue(null)
      setDelta(null)
      setMouseX(null)
      setMouseY(null)

      if (onCommit) {
        onCommit(value)
      } else {
        onChange(value)
      }

      document.exitPointerLock()
    }

    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseDown = (event) => {
    const { convertFrom, value } = props

    setIsDragging(true)
    setStartValue(convertFrom(value))
    setDelta(0)
    setMouseX(event.clientX)
    setMouseY(event.clientY)

    scrubberEl?.current?.requestPointerLock()

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const {
    tag,
    children,
    smallStep,
    mediumStep,
    largeStep,
    sensitivity,
    min,
    max,
    precision,
    convertFrom,
    convertTo,
    value,
    onChange,
    onCommit,
    ...rest
  } = props

  return (
    <ScrubberContainer as={tag} ref={scrubberEl} onMouseDown={handleMouseDown} {...rest}>
      {children}
      {isDragging && (
        <Portal>
          <Overlay pointerEvents="none">
            <Cursor x={mouseX} y={mouseY} />
          </Overlay>
        </Portal>
      )}
    </ScrubberContainer>
  )
}

Scrubber.defaultProps = {
  tag: 'label',
  smallStep: 0.025,
  mediumStep: 0.1,
  largeStep: 0.25,
  sensitivity: 5,
  min: -Infinity,
  max: Infinity,
  convertFrom: (value) => value,
  convertTo: (value) => value
}

/**
 *
 * @author Robert Long
 */
export default React.memo(Scrubber)
