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

import { useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { Popup as ReactjsPopup } from 'reactjs-popup'
import { PopupProps } from 'reactjs-popup/dist/types'

function adjustOffset(rect: DOMRect, offsetX: number, offsetY: number, thresholdX = 10, thresholdY = 15) {
  let x = offsetX,
    y = offsetY
  if (rect.top < 0) {
    y += rect.top - thresholdY
  }
  if (rect.left < 0) {
    x += rect.left - thresholdX
  }
  if (rect.bottom > window.innerHeight) {
    y -= rect.bottom - window.innerHeight + thresholdY
  }
  if (rect.right > window.innerWidth) {
    x -= rect.right - window.innerWidth + thresholdX
  }

  return { x, y }
}

const ShowContextMenu = ({
  anchorEvent,
  children,
  ...props
}: { onClose: () => void; anchorEvent: React.MouseEvent<HTMLElement> } & Omit<PopupProps, 'trigger' | 'onClose'>) => {
  const offset = useHookstate({ x: anchorEvent.clientX, y: anchorEvent.clientY })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    offset.set(adjustOffset(ref.current.getBoundingClientRect(), offset.x.value, offset.y.value))
  }, [])

  return (
    <ReactjsPopup
      open
      closeOnDocumentClick
      closeOnEscape
      repositionOnResize
      arrow={false}
      on={'click'}
      offsetX={offset.x.value}
      offsetY={offset.y.value}
      {...props}
    >
      <div
        ref={ref}
        style={{ all: 'unset', position: 'fixed', left: offset.x.value + 'px', top: offset.y.value + 'px' }}
      >
        {children}
      </div>
    </ReactjsPopup>
  )
}

export const ContextMenu = ({
  anchorEvent,
  children,
  ...props
}: { onClose: () => void; anchorEvent?: React.MouseEvent<HTMLElement> } & Omit<PopupProps, 'trigger' | 'onClose'>) => {
  return anchorEvent ? <ShowContextMenu anchorEvent={anchorEvent} children={children} {...props} /> : null
}
