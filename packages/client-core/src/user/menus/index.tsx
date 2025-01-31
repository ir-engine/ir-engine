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

import { useMutableState } from '@ir-engine/hyperflux'
import { Emote, Send01Lg, User01Lg } from '@ir-engine/ui/src/icons'

import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaUserFriends } from 'react-icons/fa'
import { PopoverState } from '../../common/services/PopoverState'
import { ViewerMenuState } from '../../util/ViewerMenuState'
import LocationIconButton from '../components/LocationIconButton'
import EmoteMenu from './EmoteMenu'
import ProfileMenu from './ProfileMenu'
import ShareMenu from './ShareMenu'
import FriendsMenu from './social/FriendsMenu'

export default function UserMenus() {
  const userMenus = useMutableState(ViewerMenuState).userMenus
  const { t } = useTranslation()

  return (
    <>
      <div className="flex w-full items-center justify-center gap-x-6">
        {userMenus.profile && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.settings'),
              position: 'top'
            }}
            icon={User01Lg}
            onClick={() => PopoverState.showPopupover(<ProfileMenu />)}
          />
        )}
        {userMenus.share && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.sendLocation'),
              position: 'top'
            }}
            icon={Send01Lg}
            onClick={() => PopoverState.showPopupover(<ShareMenu />)}
          />
        )}
        {userMenus.emote && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.emote'),
              position: 'top'
            }}
            icon={Emote}
            onClick={() => PopoverState.showPopupover(<EmoteMenu />)}
          />
        )}
        {userMenus.social && (
          <LocationIconButton
            tooltip={{
              title: t('user:menu.friends'),
              position: 'top'
            }}
            // @ts-ignore
            icon={FaUserFriends}
            onClick={() => PopoverState.showPopupover(<FriendsMenu />)}
          />
        )}
      </div>
      <PopupMenu />
    </>
  )
}
