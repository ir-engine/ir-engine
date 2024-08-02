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

import { Bounds, getBounds, getViewportBounds } from '@etherealengine/xrui'

export const calculateAndApplyYOffset = (element: HTMLElement | null, additionalOffset = 0) => {
  if (!element) {
    return
  }
  const popupBounds = getBounds(element)
  const viewportBounds = getViewportBounds(new Bounds())

  const overflowTop = viewportBounds.top - (popupBounds?.top ?? 0)
  const overflowBottom =
    (popupBounds?.top ?? 0) + (popupBounds?.height ?? 0) - (viewportBounds.top + viewportBounds.height)

  let offsetY = additionalOffset

  if (overflowTop > 0) {
    // popup is overflowing at the top, move it down
    offsetY = overflowTop
  } else if (overflowBottom > 0) {
    // popup is overflowing at the bottom, move it up
    offsetY = -overflowBottom
  }

  element.style.transform = `translateY(${offsetY}px)`
}

export const calculateAndApplyXOffset = (element: HTMLElement | null, additionalOffset = 0) => {
  if (!element) {
    return
  }
  const popupBounds = getBounds(element)
  const viewportBounds = getViewportBounds(new Bounds())

  const overflowLeft = viewportBounds.left - (popupBounds?.left ?? 0)
  const overflowRight =
    (popupBounds?.left ?? 0) + (popupBounds?.width ?? 0) - (viewportBounds.left + viewportBounds.width)

  let offsetX = additionalOffset

  if (overflowLeft > 0) {
    offsetX = overflowLeft
  } else if (overflowRight > 0) {
    offsetX = -overflowRight
  }

  element.style.transform = `translateX(${offsetX}px)`
}
