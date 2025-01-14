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

import { useEffect, useRef } from 'react'

type Options = {
  targetId: string
  placerId?: string
  topOffset?: number
  targetStartX?: number
  targetStartY?: number
}

export const useDraggable = ({ targetId, placerId = targetId, topOffset = 0, targetStartX, targetStartY }: Options) => {
  const isDragging = useRef<boolean>(false)

  const coords = useRef<{
    startX: number
    startY: number
    lastX: number
    lastY: number
  }>({
    startX: targetStartX || 0,
    startY: targetStartY || 0,
    lastX: targetStartX || 0,
    lastY: (targetStartY && targetStartY + topOffset) || 0
  })

  useEffect(() => {
    const target = document.getElementById(targetId)
    let placer = document.getElementById(placerId)
    if (!target) {
      console.error("Element with given id doesn't exist")
      return
    }
    target.style.marginTop = `${topOffset}px`
    target.style.left = `${targetStartX || 0}px`
    target.style.top = `${targetStartY || 0}px`
    if (!placer) {
      placer = target
    }

    const container = target.parentElement
    if (!container) {
      console.error('Target element must have a parent')
      return
    }

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      coords.current.startX = e.clientX
      coords.current.startY = e.clientY + topOffset
      document.body.style.userSelect = 'none'
      placer!.style.cursor = 'grabbing'
    }

    const onMouseUp = () => {
      isDragging.current = false
      coords.current.lastX = target.offsetLeft
      coords.current.lastY = target.offsetTop
      document.body.style.userSelect = 'auto'
      placer!.style.cursor = 'grab'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const parentRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      const maxX = parentRect.width - targetRect.width
      const maxY = parentRect.height - targetRect.height

      let nextX = e.clientX - coords.current.startX + coords.current.lastX
      let nextY = e.clientY - coords.current.startY + coords.current.lastY

      nextX = Math.max(0, Math.min(nextX, maxX))
      nextY = Math.max(0, Math.min(nextY, maxY))

      target.style.top = `${nextY}px`
      target.style.left = `${nextX}px`
    }

    placer.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseUp)

    return () => {
      placer.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseUp)
    }
  }, [targetId, placerId])

  return {
    isDragging: isDragging.current,
    startX: coords.current.startX,
    startY: coords.current.startY
  }
}
