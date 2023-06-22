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

import React from 'react'

type PropsType = {
  isPiP: boolean
  children: any
}
export const Draggable = ({ isPiP, children }: PropsType) => {
  let prev = { x: 0, y: 0 }
  let MARGIN = 20
  let PIP_WIDTH = 250
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

  const styles = isPiP
    ? ({
        touchAction: 'none',
        left: window.innerWidth - MARGIN - PIP_WIDTH,
        top: 20,
        transition: 'all 0.1s linear',
        zIndex: 1500
      } as any)
    : ({ position: 'initial' } as any)

  const handles = isPiP
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
    <div {...handles} style={styles}>
      {children}
    </div>
  )
}

export default Draggable
