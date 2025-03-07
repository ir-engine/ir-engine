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

import { useFind } from '@ir-engine/common'
import { identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Button } from '@ir-engine/ui'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import Toggle from '@ir-engine/ui/src/primitives/tailwind/Toggle'
import React, { useRef } from 'react'
import { HiPencil } from 'react-icons/hi2'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { useUserAvatarThumbnail } from '../../../hooks/useUserAvatarThumbnail'
import AvatarSelectMenu from '../../../user/menus/avatar/AvatarSelectMenu'
import { AuthState } from '../../../user/services/AuthService'
import { PopoverState } from '../../services/PopoverState'
import { ThemeState } from '../../services/ThemeService'

const ProfilePill = () => {
  const user = getMutableState(AuthState).user
  const avatarThumbnail = useUserAvatarThumbnail(user.value.id)
  const identityProvidersQuery = useFind(identityProviderPath)
  const email = identityProvidersQuery.data.find((ip) => ip.type === 'email')?.accountIdentifier
  const popUpOpened = useHookstate(false)
  const themeState = useMutableState(ThemeState)
  const avatarSelectMenuRef = useRef<{
    handleClose: () => Promise<void>
  } | null>(null)

  const onAvatarSelectClose = () => {
    if (avatarSelectMenuRef.current) {
      avatarSelectMenuRef.current?.handleClose()
    } else {
      PopoverState.hidePopupover()
    }
  }

  return (
    <Popup
      position={'bottom center'}
      closeOnDocumentClick={true}
      open={popUpOpened.value}
      onOpen={() => popUpOpened.set(true)}
      onClose={() => popUpOpened.set(false)}
      trigger={
        <button className="flex h-8 w-16 items-center justify-center gap-2 rounded-full bg-ui-background focus:ring-1">
          <div className="ml-1 h-6 w-6 overflow-hidden rounded-full">
            <img src={avatarThumbnail} className="h-full w-full" />
          </div>

          <div className="cursor-pointer pr-2">
            <MdOutlineKeyboardArrowDown className="h-4 w-4" />
          </div>
        </button>
      }
    >
      <div className="flex w-80 min-w-fit max-w-[30wv] -translate-x-1/2 flex-col gap-1 truncate rounded-lg border border-ui-outline bg-surface-1 p-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative h-14 w-14">
            <img className="rounded-full" src={avatarThumbnail} />
            <Button
              size="xs"
              variant="secondary"
              data-testid="edit-avatar-button"
              className="absolute bottom-0 left-10 rounded-full p-1 text-[#F5F5F5]"
              onClick={() => {
                popUpOpened.set(false)
                PopoverState.showPopupover(
                  <AvatarSelectMenu ref={avatarSelectMenuRef} showBackButton={false} />,
                  onAvatarSelectClose
                )
              }}
            >
              <HiPencil />
            </Button>
          </div>

          <Toggle
            value={themeState.theme.value === 'dark'}
            onChange={() => {
              ThemeState.setTheme(themeState.theme.value === 'light' ? 'dark' : 'light')
            }}
            label="Dark Mode"
          />

          <div className="flex flex-col gap-1">
            <span className="text-xl font-medium text-text-primary">{user.value.name}</span>
            <span className="text-base text-text-secondary">{email}</span>
          </div>
        </div>
        <hr className="mb-1 mt-4 w-full border border-ui-outline" />
      </div>
    </Popup>
  )
}

export default ProfilePill
