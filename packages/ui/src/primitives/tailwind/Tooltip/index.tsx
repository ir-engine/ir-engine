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

import React, { ReactNode, useEffect, useRef, useState } from 'react'
import './tooltip.css'

export interface TooltipProps {
  title?: string
  content: ReactNode
  children: ReactNode
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right'
}

function Tooltip({ title, content, children, position = 'auto' }: TooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState('bottom')
  const triggerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (position === 'auto' && triggerRef.current) {
      calculatePosition()
    } else {
      setTooltipPosition(position)
    }
  }, [position])

  const calculatePosition = () => {
    if (!triggerRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const fitsTop = triggerRect.top >= 50
    const fitsBottom = viewportHeight - triggerRect.bottom >= 50
    const fitsLeft = triggerRect.left >= 50
    const fitsRight = viewportWidth - triggerRect.right >= 50

    if (fitsTop) setTooltipPosition('top')
    else if (fitsBottom) setTooltipPosition('bottom')
    else if (fitsRight) setTooltipPosition('right')
    else if (fitsLeft) setTooltipPosition('left')
    else setTooltipPosition('top')
  }

  const getPositionClasses = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'left-1/2 bottom-full mb-3 -translate-x-1/2'
      case 'bottom':
        return 'left-1/2 top-full mt-3 -translate-x-1/2'
      case 'left':
        return 'right-full top-1/2 mr-3 -translate-y-1/2'
      case 'right':
        return 'left-full top-1/2 ml-3 -translate-y-1/2'
      default:
        return 'left-1/2 bottom-full mb-3 -translate-x-1/2'
    }
  }

  const getArrowStyles = () => {
    switch (tooltipPosition) {
      case 'top':
        return 'bottom-[-4px] left-1/2 -translate-x-1/2'
      case 'bottom':
        return 'top-[-4px] left-1/2 -translate-x-1/2'
      case 'left':
        return 'right-[-4px] top-1/2 -translate-y-1/2'
      case 'right':
        return 'left-[-4px] top-1/2 -translate-y-1/2'
      default:
        return 'bottom-[-4px] left-1/2 -translate-x-1/2'
    }
  }

  return (
    <div ref={triggerRef} className="group relative flex max-w-max flex-col items-center justify-center">
      {children}
      <div
        className={`absolute ${getPositionClasses()} min-w-max scale-0 transform  transition duration-300 group-hover:scale-100`}
        style={{ zIndex: 9999 }}
      >
        <div className="relative flex max-w-xs flex-col items-center shadow-lg">
          <div
            className={`absolute ${getArrowStyles()} h-3 w-3 rotate-45 transform border-b border-theme-primary bg-[#191B1F]`}
          ></div>

          <div className="rounded border border-theme-primary bg-[#191B1F] px-4 py-2 text-center text-xs text-white">
            {title && <div className="mb-1 text-sm font-semibold text-white">{title}</div>}
            <div>{content}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tooltip
