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
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { Popup } from '@ir-engine/ui/src/components/tailwind/Popup'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { BiSolidPencil } from 'react-icons/bi'
import { MdOutlineKeyboardArrowDown } from 'react-icons/md'
import { UserMenus } from '../../../user/UserUISystem'
import { PopupMenuServices } from '../../../user/components/UserMenu/PopupMenuService'
import { useUserAvatarThumbnail } from '../../../user/functions/useUserAvatarThumbnail'
import { AuthState } from '../../../user/services/AuthService'

const ProfilePill = () => {
  const user = getMutableState(AuthState).user
  const avatarThumbnail = useUserAvatarThumbnail(user.value.id)
  const identityProvidersQuery = useFind(identityProviderPath)
  const email = identityProvidersQuery.data.find((ip) => ip.type === 'email')?.accountIdentifier
  const popUpOpened = useHookstate(false)
  return (
    <Popup
      position={'bottom center'}
      closeOnDocumentClick={true}
      open={popUpOpened.value}
      onOpen={() => popUpOpened.set(true)}
      onClose={() => popUpOpened.set(false)}
      trigger={
        <button className="flex h-8 w-16 items-center justify-center gap-2 rounded-full bg-[#191B1F] focus:ring-1 focus:ring-blue-primary">
          <div className="ml-1 h-6 w-6 overflow-hidden rounded-full">
            <img src={avatarThumbnail} className="h-full w-full" />
          </div>

          <div className="cursor-pointer pr-2">
            <MdOutlineKeyboardArrowDown className="h-4 w-4" />
          </div>
        </button>
      }
    >
      <div className="flex w-80 min-w-fit max-w-[30wv]  -translate-x-1/2 flex-col gap-1 truncate rounded-lg bg-[#141619] p-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="relative h-14 w-14">
            <img className="rounded-full" src={avatarThumbnail} />
            <Button
              rounded="full"
              size="small"
              fullWidth={false}
              variant="secondary"
              data-testid="edit-avatar-button"
              className="absolute bottom-0 left-10 h-6 w-6 border-blue-900 border-opacity-65 text-white"
              startIcon={<BiSolidPencil size={16} />}
              onClick={() => {
                popUpOpened.set(false)
                PopupMenuServices.showPopupMenu(UserMenus.AvatarSelect2)
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xl font-medium text-[#F5F5F5]">{user.value.name}</span>
            <span className="text-base text-[#B2B5BD]">{email}</span>
          </div>
        </div>
        <div className="mb-1 mt-4 w-full border border-[#212226]" />
      </div>
    </Popup>
  )
}

export default ProfilePill
