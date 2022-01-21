import React from 'react'

type PropsType = {
  isPiP: boolean
}
export class Draggable extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props)
  }

  prev = { x: 0, y: 0 }
  MARGIN = 20
  dragStarted = false

  clamp = (low, value, high) => {
    if (value < low) return low
    if (value > high) return high
    return value
  }

  handleMouseDown = (e) => {
    if (e.button !== 0 && e.type !== 'touchstart') return

    const point = this.getCoordinates(e)
    this.dragStarted = true
    this.prev = point
    e.currentTarget.style.transition = ''
  }

  handleMouseMove = (e) => {
    if (!this.dragStarted) return
    const point = this.getCoordinates(e)
    const container = e.currentTarget

    const boundingRect = container.getBoundingClientRect()
    container.style.left =
      this.clamp(
        this.MARGIN,
        boundingRect.left + point.x - this.prev.x,
        window.innerWidth - boundingRect.width - this.MARGIN
      ) + 'px'
    container.style.top =
      this.clamp(
        this.MARGIN,
        boundingRect.top + point.y - this.prev.y,
        window.innerHeight - boundingRect.height - this.MARGIN
      ) + 'px'
    this.prev = point
  }

  handleMouseUp = (e) => {
    this.dragStarted = false
    this.prev = { x: 0, y: 0 }
    const container = e.currentTarget
    const boundingRect = container.getBoundingClientRect()
    const margin = {
      left: boundingRect.left - this.MARGIN,
      right: window.innerWidth - boundingRect.left - boundingRect.width - this.MARGIN
    }

    let p =
      margin.left <= margin.right
        ? { x: this.MARGIN, y: boundingRect.top }
        : { x: window.innerWidth - boundingRect.width - this.MARGIN, y: boundingRect.top }

    container.style.left = p.x + 'px'
    container.style.top = p.y + 'px'
    container.style.transition = 'all 0.1s linear'
  }

  getCoordinates = (e) => {
    if (e.touches) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    } else {
      return {
        x: e.clientX,
        y: e.clientY
      }
    }
  }

  getStyle = () => {
    if (this.props.isPiP)
      return {
        touchAction: 'none',
        position: 'fixed',
        left: 130,
        top: 20,
        transition: 'all 0.1s linear',
        zIndex: 1500
      } as any
    else {
      return { position: 'initial' } as any
    }
  }

  render() {
    const handles = this.props.isPiP
      ? {
          onTouchStart: this.handleMouseDown,
          onTouchMove: this.handleMouseMove,
          onTouchEnd: this.handleMouseUp,
          onMouseDown: this.handleMouseDown,
          onMouseMove: this.handleMouseMove,
          onMouseUp: this.handleMouseUp,
          onMouseLeave: this.handleMouseMove
        }
      : []
    return (
      <div {...handles} style={this.getStyle()}>
        {this.props.children}
      </div>
    )
  }
}

export default Draggable
