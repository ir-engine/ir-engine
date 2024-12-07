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

export const useDraggeable = (id: string): void => {
  const isClicked = useRef<boolean>(false)

  const coords = useRef<{
    startX: number
    startY: number
    lastX: number
    lastY: number
  }>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0
  })

  useEffect(() => {
    const target = document.getElementById(id)
    if (!target) {
      console.error("Element with given id doesn't exist")
      return
    }

    const container = target.parentElement
    if (!container) {
      console.error('target element must have a parent')
      return
    }

    const onMouseDown = (e: MouseEvent) => {
      isClicked.current = true
      coords.current.startX = e.clientX
      coords.current.startY = e.clientY
    }

    const onMouseUp = (e: MouseEvent) => {
      isClicked.current = false
      coords.current.lastX = target.offsetLeft
      coords.current.lastY = target.offsetTop
      target.style.cursor = 'pointer'
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isClicked.current) return

      const nextX = e.clientX - coords.current.startX + coords.current.lastX
      const nextY = e.clientY - coords.current.startY + coords.current.lastY

      target.style.top = `${nextY}px`
      target.style.left = `${nextX}px`
      target.style.cursor = 'grabbing'
    }

    target.addEventListener('mousedown', onMouseDown)
    target.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseUp)

    return () => {
      target.removeEventListener('mousedown', onMouseDown)
      target.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseUp)
    }
  }, [id])
}
