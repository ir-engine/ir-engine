import React, { Component, createRef, ReactNode } from 'react'
import Portal from '../layout/Portal'
import { getStepSize, toPrecision } from '../../functions/utils'
import styled from 'styled-components'
import { ArrowsAltH } from '@styled-icons/fa-solid/ArrowsAltH'
import Overlay from '../layout/Overlay'
import { clamp } from '@xrengine/engine/src/common/functions/MathLerpFunctions'

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

type ScrubberState = {
  isDragging: boolean
  mouseX: number
  mouseY: number
  startValue: number
  delta: number
}

/**
 *
 * @author Robert Long
 */
class Scrubber extends Component<ScrubberProp, ScrubberState> {
  constructor(props) {
    super(props)
    this.scrubberEl = createRef()
    this.state = { isDragging: false, startValue: null, delta: null, mouseX: null, mouseY: null }
  }
  static defaultProps = {
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

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  scrubberEl: React.RefObject<unknown>

  handleMouseMove = (event) => {
    const state = this.state as any
    const { smallStep, mediumStep, largeStep, sensitivity, min, max, precision, convertTo, onChange } = this
      .props as any

    if (state.isDragging) {
      const mouseX = state.mouseX + event.movementX
      const mouseY = state.mouseY + event.movementY
      const nextDelta = state.delta + event.movementX
      const stepSize = getStepSize(event, smallStep, mediumStep, largeStep)
      const nextValue = state.startValue + Math.round(nextDelta / sensitivity) * stepSize
      const clampedValue = clamp(nextValue, min, max)
      const roundedValue = precision ? toPrecision(clampedValue, precision) : clampedValue
      const finalValue = convertTo(roundedValue)
      onChange(finalValue)
      this.setState({ ...state, delta: nextDelta, mouseX, mouseY })
    }
  }

  handleMouseDown = (event) => {
    const { convertFrom, value } = this.props as any

    this.setState({
      isDragging: true,
      startValue: convertFrom(value),
      delta: 0,
      mouseX: event.clientX,
      mouseY: event.clientY
    })
    ;(this.scrubberEl.current as any).requestPointerLock()

    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseUp = () => {
    const { onCommit, onChange, value } = this.props as any
    const state = this.state as any

    if (state.isDragging) {
      this.setState({ isDragging: false, startValue: null, delta: null, mouseX: null, mouseY: null })

      if (onCommit) {
        onCommit(value)
      } else {
        onChange(value)
      }

      document.exitPointerLock()
    }

    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  render() {
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
    } = this.props as any

    const { isDragging, mouseX, mouseY } = this.state as any

    return (
      <ScrubberContainer as={tag} ref={this.scrubberEl} onMouseDown={this.handleMouseDown} {...rest}>
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
}

/**
 *
 * @author Robert Long
 */
export default React.memo(Scrubber)
