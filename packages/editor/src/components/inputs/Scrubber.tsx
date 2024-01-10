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

import React, { ReactNode, useEffect, useRef } from 'react'

import { clamp } from '@etherealengine/engine/src/common/functions/MathLerpFunctions'

import MultipleStopIcon from '@mui/icons-material/MultipleStop'

import { getStepSize, toPrecision } from '../../functions/utils'
import Overlay from '../layout/Overlay'
// Import the CSS file
import { useHookstate } from '@etherealengine/hyperflux'
import Portal from '../layout/Portal'

type ScrubberContainerProps = {
  tag?: any
  children?: ReactNode
  onMouseDown: any
}

const ScrubberContainer = React.forwardRef<HTMLElement, ScrubberContainerProps>(
  ({ tag: Component = 'div', children, ...rest }: ScrubberContainerProps, ref: React.Ref<HTMLElement>) => {
    return (
      <Component ref={ref} style={{ cursor: 'ew-resize', userSelect: 'none' }} {...rest}>
        {children}
      </Component>
    )
  }
)

type CursorProps = {
  x: number
  y: number
}

const Cursor = ({ x, y }: CursorProps) => {
  return (
    <MultipleStopIcon
      className="Cursor"
      style={{
        position: 'absolute',
        width: '20px',
        transform: `translate(${x}px,${y}px)`,
        stroke: 'white',
        strokeWidth: '20px',
        fill: 'black'
      }}
    />
  )
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
  onChange: (value: any) => void
  onCommit?: (value: any) => void
}

const Scrubber: React.FC<ScrubberProps> = ({
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
}) => {
  const state = useHookstate({
    isDragging: false,
    startValue: null as number | null,
    delta: null as number | null,
    mouseX: null,
    mouseY: null
  })

  const scrubberEl = useRef<HTMLElement>(null)

  const handleMouseMove = (event) => {
    if (state.isDragging.value) {
      const mX = state.mouseX.value + event.movementX
      const mY = state.mouseY.value + event.movementY
      const nextDelta = state.delta.value + event.movementX
      const stepSize = getStepSize(event, smallStep, mediumStep, largeStep)
      const nextValue = (state.startValue.value as number) + Math.round(nextDelta / (sensitivity || 1)) * stepSize
      const clampedValue = clamp(nextValue, min ?? -Infinity, max ?? Infinity)
      const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
      const finalValue = convertTo(roundedValue)
      onChange(finalValue)

      state.delta.set(nextDelta)
      state.mouseX.set(mX)
      state.mouseY.set(mY)
    }
  }

  const handleMouseUp = () => {
    if (state.isDragging.value) {
      state.isDragging.set(false)
      state.startValue.set(null)
      state.delta.set(null)
      state.mouseX.set(null)
      state.mouseY.set(null)

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

  const handleMouseDown = (event) => {
    state.isDragging.set(true)
    state.startValue.set(convertFrom(value))
    state.delta.set(0)
    state.mouseX.set(event.clientX)
    state.mouseY.set(event.clientY)
    scrubberEl?.current?.requestPointerLock()
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <ScrubberContainer tag={tag} ref={scrubberEl} onMouseDown={handleMouseDown} {...rest}>
      {children}
      {state.isDragging.value && (
        <Portal>
          <Overlay pointerEvents="none">
            <Cursor x={state.mouseX.value!} y={state.mouseY.value!} />
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

export default React.memo(Scrubber)
