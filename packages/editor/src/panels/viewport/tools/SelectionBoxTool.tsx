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

import { defineState, getMutableState } from '@ir-engine/hyperflux'
import React, { useEffect, useState } from 'react'
export const selectionBox = defineState({
  name: 'selection Box',
  initial: () => ({
    selectionBoxEnabled: false
  })
})

export default function SelectionBox({
  viewportRef,
  toolbarRef
}: {
  viewportRef: React.RefObject<HTMLDivElement>
  toolbarRef: React.RefObject<HTMLDivElement>
}) {
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [left, setLeft] = useState(0)
  const [top, setTop] = useState(0)
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [isSelecting, setIsSelecting] = useState(false)
  const [mouseOffsetX, setMouseOffsetX] = useState(0)
  const [mouseOffsetY, setMouseOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const handleMouseDown = (e: React.MouseEvent) => {
    const viewportRect = viewportRef.current!.getBoundingClientRect()
    const toolbarRect = toolbarRef.current!.getBoundingClientRect()
    setStartX(e.clientX)
    setStartY(e.clientY)
    setIsDragging(true)
    setLeft(e.clientX - viewportRect.left)
    setTop(e.clientY - viewportRect.top - toolbarRect.height)
    setWidth(0)
    setHeight(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setWidth(e.clientX - startX)
    setHeight(e.clientY - startY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown as any)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown as any)
    }
  }, [isDragging])
  return (
    <div className="relative h-full w-full">
      {getMutableState(selectionBox).selectionBoxEnabled.value && isDragging && (
        <div
          className="absolute z-[5] flex flex-col items-center border-2 border-dashed border-white bg-transparent"
          style={{
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`
          }}
        />
      )}
      {/* )} */}
    </div>
  )
}
