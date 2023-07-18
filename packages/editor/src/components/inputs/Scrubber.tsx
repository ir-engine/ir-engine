/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { ReactNode, useEffect, useRef, useState } from 'react'

import './Scrubber.css'

import { clamp } from '@etherealengine/engine/src/common/functions/MathLerpFunctions'

import MultipleStopIcon from '@mui/icons-material/MultipleStop'

import { getStepSize, toPrecision } from '../../functions/utils'
import Overlay from '../layout/Overlay'
// Import the CSS file
import Portal from '../layout/Portal'

type ScrubberContainerProps = {
  tag?: keyof JSX.IntrinsicElements
  children?: ReactNode
  onMouseDown: any
}

const ScrubberContainer = ({ tag: Component = 'div', children, ...rest }: ScrubberContainerProps) => {
  return (
    <Component className="ScrubberContainer" {...rest}>
      {children}
    </Component>
  )
}

type CursorProps = {
  x: number
  y: number
}

const Cursor = ({ x, y }: CursorProps) => {
  return <MultipleStopIcon className="Cursor" style={{ transform: `translate(${x}px,${y}px)` }} />
}

type ScrubberProps = {
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
  onChange: Function
  onCommit?: Function
}

export const Scrubber = React.forwardRef(
  ({
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
  }: ScrubberProps) => {
    const [isDragging, setIsDragging] = useState(false)
    const [startValue, setStartValue] = useState<number | null>(null)
    const [delta, setDelta] = useState<number | null>(null)
    const [mouseX, setMouseX] = useState<number | null>(null)
    const [mouseY, setMouseY] = useState<number | null>(null)
    const scrubberEl = useRef<HTMLDivElement>(null)

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const mX = mouseX! + event.movementX
        const mY = mouseY! + event.movementY
        const nextDelta = delta! + event.movementX
        const stepSize = getStepSize(event, smallStep, mediumStep, largeStep)
        const nextValue = (startValue! as number) + Math.round(nextDelta / (sensitivity || 1)) * stepSize
        const clampedValue = min != null && max != null ? clamp(nextValue, min, max) : nextValue
        const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
        const finalValue = convertTo(roundedValue)
        onChange(finalValue)

        setDelta(nextDelta)
        setMouseX(mX)
        setMouseY(mY)
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setStartValue(null)
        setDelta(null)
        setMouseX(null)
        setMouseY(null)

        if (onCommit) {
          onCommit(value)
        }

        document.exitPointerLock()
      }

      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    useEffect(() => {
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }, [])

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true)
      setStartValue(convertFrom(value))
      setDelta(0)
      setMouseX(event.clientX)
      setMouseY(event.clientY)

      scrubberEl.current?.requestPointerLock()

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return (
      <ScrubberContainer tag={tag} onMouseDown={handleMouseDown} {...rest}>
        {children}
        {isDragging && (
          <Portal>
            <Overlay pointerEvents="none">
              <Cursor x={mouseX!} y={mouseY!} />
            </Overlay>
          </Portal>
        )}
      </ScrubberContainer>
    )
  }
)

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

export default React.memo(Scrubber)
