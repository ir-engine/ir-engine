import React from 'react'

type PropsType = {
  isPiP: boolean
  children: any
}
export const Draggable = (props: PropsType) => {
  let prev = { x: 0, y: 0 }
  let MARGIN = 20
  let dragStarted = false

  const clamp = (low, value, high) => {
    if (value < low) return low
    if (value > high) return high
    return value
  }

  const handleMouseDown = (e) => {
    if (e.button !== 0 && e.type !== 'touchstart') return

    const point = getCoordinates(e)
    dragStarted = true
    prev = point
    e.currentTarget.style.transition = ''
  }

  const handleMouseMove = (e) => {
    if (!dragStarted) return
    const point = getCoordinates(e)
    const container = e.currentTarget

    const boundingRect = container.getBoundingClientRect()
    container.style.left =
      clamp(MARGIN, boundingRect.left + point.x - prev.x, window.innerWidth - boundingRect.width - MARGIN) + 'px'
    container.style.top =
      clamp(MARGIN, boundingRect.top + point.y - prev.y, window.innerHeight - boundingRect.height - MARGIN) + 'px'
    prev = point
  }

  const handleMouseUp = (e) => {
    dragStarted = false
    prev = { x: 0, y: 0 }
    const container = e.currentTarget
    const boundingRect = container.getBoundingClientRect()
    const margin = {
      left: boundingRect.left - MARGIN,
      right: window.innerWidth - boundingRect.left - boundingRect.width - MARGIN
    }

    let p =
      margin.left <= margin.right
        ? { x: MARGIN, y: boundingRect.top }
        : { x: window.innerWidth - boundingRect.width - MARGIN, y: boundingRect.top }

    container.style.left = p.x + 'px'
    container.style.top = p.y + 'px'
    container.style.transition = 'all 0.1s linear'
  }

  const getCoordinates = (e) => {
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

  const getStyle = () => {
    if (props.isPiP)
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

  const handles = props.isPiP
    ? {
        onTouchStart: handleMouseDown,
        onTouchMove: handleMouseMove,
        onTouchEnd: handleMouseUp,
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseMove
      }
    : []
  return (
    <div {...handles} style={getStyle()}>
      {props.children}
    </div>
  )
}

export default Draggable
