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

import React from 'react'

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'

import { getState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

const ClickawayListener = (props: { children: React.ReactNode; onClickOutside: VoidFunction | null }) => {
  const backdropMode = getState(ModalState).backdrop
  const callbackRef = useRef<VoidFunction | null>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const element = backdropRef.current
      if (!element) {
        return
      }

      let isClickedInside = false

      for (const child of element.children) {
        if (child.contains(e.target as Node)) {
          isClickedInside = true
          break
        }
      }

      if (!isClickedInside && callbackRef.current) {
        callbackRef.current()
      }
    }

    const eventName = isMobile ? 'pointerup' : 'mousedown'
    document.addEventListener(eventName, handler)

    return () => {
      document.removeEventListener(eventName, handler)
    }
  }, [])

  useEffect(() => {
    callbackRef.current = props.onClickOutside || null
  }, [props.onClickOutside])

  return (
    <div
      ref={backdropRef}
      className={twMerge(
        'fixed inset-0 z-[1000] flex h-full w-full items-center justify-center',
        backdropMode === 'blur' ? 'backdrop-blur-[50px]' : 'bg-transparent/50'
      )}
    >
      {props.children}
    </div>
  )
}

ClickawayListener.displayName = 'ClickawayListener'

ClickawayListener.defaultProps = {
  children: null
}

export default ClickawayListener
