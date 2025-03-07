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

import React, { ReactNode, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import './tooltip.css'

export interface BaseTooltipProps {
  title?: string
  content: ReactNode
  children: ReactNode
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right'
}

export interface ControlledProps {
  isControlled: true
  onMouseEnter: () => boolean
  onMouseLeave: () => boolean
}

export interface UncontrolledProps {
  isControlled?: false
}

export type TooltipProps = BaseTooltipProps & (ControlledProps | UncontrolledProps)

export interface TooltipRef {
  showTooltip: () => void
  hideTooltip: () => void
}

/**
 * Provides an imperative handle to show and hide the tooltip
 */
function Tooltip(
  { title, content, children, position = 'auto', isControlled = false, ...props }: TooltipProps,
  ref: React.ForwardedRef<TooltipRef>
) {
  const [tooltipPosition, setTooltipPosition] = useState('bottom')
  const [tooltipStyles, setTooltipStyles] = useState({ top: 0, left: 0 } as React.CSSProperties)
  const [visibleState, setIsVisible] = useState('hidden' as 'hidden' | 'calculating' | 'visible')
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  useImperativeHandle(
    ref,
    () => {
      return {
        showTooltip: showTooltip,
        hideTooltip: hideTooltip
      }
    },
    []
  )

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return null
    const tooltipRect = tooltipRef.current.getBoundingClientRect()

    let calculatedPosition = position
    let top = 0
    let left = 0

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const spaceTop = triggerRect.top
    const spaceBottom = viewportHeight - triggerRect.bottom
    const spaceLeft = triggerRect.left
    const spaceRight = viewportWidth - triggerRect.right

    if (position === 'auto') {
      const maxSpace = Math.max(spaceTop, spaceBottom, spaceLeft, spaceRight)
      if (maxSpace === spaceTop) calculatedPosition = 'top'
      else if (maxSpace === spaceBottom) calculatedPosition = 'bottom'
      else if (maxSpace === spaceLeft) calculatedPosition = 'left'
      else if (maxSpace === spaceRight) calculatedPosition = 'right'
    }

    setTooltipPosition(calculatedPosition)

    switch (calculatedPosition) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        break
      case 'bottom':
        top = triggerRect.bottom + 6
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        break
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        left = triggerRect.left - tooltipRect.width - 6
        break
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        left = triggerRect.right + 6
        break
      default:
        top = triggerRect.bottom + 6
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        break
    }

    setTooltipStyles({ top, left })
  }

  const showTooltip = () => {
    if (isControlled) {
      if ('onMouseEnter' in props && props.onMouseEnter && props.onMouseEnter()) {
        setIsVisible('calculating')
      }
    } else if (visibleState === 'hidden') {
      setIsVisible('calculating')
    }
  }

  const hideTooltip = () => {
    if (isControlled) {
      if ('onMouseLeave' in props && props.onMouseLeave && !props.onMouseLeave()) {
        setIsVisible('hidden')
      }
    } else if (visibleState !== 'hidden') {
      setIsVisible('hidden')
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (visibleState) {
        calculatePosition()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [visibleState])

  useEffect(() => {
    if (visibleState) {
      calculatePosition()
    }
  }, [position])

  useEffect(() => {
    if (visibleState === 'calculating' && triggerRef.current && tooltipRef.current) {
      calculatePosition()
      setIsVisible('visible')
    }
  }, [visibleState, title, content])

  return (
    <div
      ref={triggerRef}
      className="group relative flex max-w-max flex-col items-center justify-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {visibleState !== 'hidden' &&
        ReactDOM.createPortal(
          <div
            ref={tooltipRef}
            className={`tooltip ${
              visibleState === 'visible' ? 'tooltip-visible' : ''
            } absolute min-w-max transform transition duration-300`}
            style={{ ...tooltipStyles, zIndex: 9999, position: 'absolute' }}
          >
            <div className="relative flex max-w-xs flex-col items-center shadow-lg">
              <div
                className={`tooltip-arrow absolute tooltip-arrow-${tooltipPosition} h-3 w-3 rotate-45 transform border-b border-theme-primary bg-[#191B1F]`}
              ></div>

              <div className="rounded border border-theme-primary bg-[#191B1F] px-4 py-2 text-center text-xs text-white">
                {title && <div className="mb-1 text-sm font-semibold text-white">{title}</div>}
                <div>{content}</div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default React.forwardRef(Tooltip)
