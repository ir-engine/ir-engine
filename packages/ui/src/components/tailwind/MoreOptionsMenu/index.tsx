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

import React, { useRef } from 'react'
import Popup from 'reactjs-popup'
import { PopupActions, PopupPosition } from 'reactjs-popup/dist/types'
import { twMerge } from 'tailwind-merge'
import { Button } from '../../..'
import { DotsHorizontalLg, DotsVerticalLg } from '../../../icons'

interface MoreOptionsMenuProps {
  disabled?: boolean
  direction?: 'horizontal' | 'vertical'
  actionProps: {
    icon?: React.ReactNode
    label: string
    onClick: () => void
    disabled?: boolean
  }[]
  position?: PopupPosition | PopupPosition[] | undefined
}

export default function MoreOptionsMenu({
  disabled,
  actionProps,
  position,
  direction = 'vertical'
}: MoreOptionsMenuProps) {
  const popupRef = useRef<PopupActions>(null)

  const closePopup = () => {
    if (popupRef.current) {
      popupRef.current.close()
    }
  }

  return (
    <Popup
      trigger={
        <Button
          variant="tertiary"
          size="sm"
          className="border-0 px-2 py-1.5"
          data-testid="more-options-button"
          disabled={disabled}
        >
          {direction === 'vertical' && <DotsVerticalLg className="text-xl text-text-primary" />}
          {direction === 'horizontal' && <DotsHorizontalLg className="text-xl text-text-primary" />}
        </Button>
      }
      ref={popupRef}
      position={position ? position : 'left bottom'}
      on="click"
      closeOnDocumentClick
      arrow={false}
      repositionOnResize={true}
      contentStyle={{ padding: '0px', border: 'none' }}
    >
      <ul
        className={twMerge(
          'w-[180px] divide-y divide-gray-300 rounded-lg border border-ui-tertiary',
          'bg-white dark:divide-none dark:border-none dark:bg-surface-4'
        )}
        data-testid="more-options-list"
      >
        {actionProps.map((actionProp, index) => (
          <li className="h-8" key={index}>
            <Button
              variant="tertiary"
              className="h-full w-full justify-start gap-2 border-0 p-2 text-text-primary hover:bg-ui-hover-quadrary"
              data-testid={`${actionProp.label.toLowerCase().replace(' ', '-')}-button`}
              disabled={actionProp.disabled}
              onClick={() => {
                closePopup()
                actionProp.onClick()
              }}
            >
              {actionProp.icon}
              {actionProp.label}
            </Button>
          </li>
        ))}
      </ul>
    </Popup>
  )
}
