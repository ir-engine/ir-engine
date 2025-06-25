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

import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { MultiplayerState } from '../../common/services/MultiplayerState'
import { AuthService, AuthState } from '../../user/services/AuthService'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import ButtonGroup from './ButtonGroup'
import { MenuItem } from './MenuItem'
import { Section } from './Section'
import SliderItem from './SliderItem'
import ToggleItem from './ToggleItem'

// Define types for screen components
type ScreenProps = NavigateFuncProps & {}

const MainMenu: React.FC<ScreenProps> = ({ navigateTo }) => {
  const audioState = useMutableState(AudioState)
  const isGuest = useMutableState(AuthState).user.isGuest.value
  const confirmLogout = useHookstate(false)
  const { world } = useMutableState(MultiplayerState)

  if (confirmLogout.value) {
    return (
      <Inner className="mx-auto flex min-h-full max-w-sm flex-col items-center justify-between">
        <div className="text-dm-sans m-auto flex w-full flex-1 flex-col justify-center text-center text-2xl text-white">
          Are you sure you want to logout?
        </div>
        <ButtonGroup
          options={[
            { label: 'Logout', onClick: () => AuthService.logoutUser() },
            { label: 'Nevermind', onClick: () => confirmLogout.set(false) }
          ]}
        />
      </Inner>
    )
  }

  return (
    <Inner className="space-y-4">
      {/* Communication Section */}
      <Section>
        <MenuItem label="Share Space" onClick={() => navigateTo('settings/share')} hasChevron />
      </Section>
      <Section>
        <SliderItem
          label="Mic Volume"
          value={audioState.microphoneGain.value * 100}
          onChange={(value) => audioState.microphoneGain.set(value / 100)}
        />
        <Divider />
        <SliderItem
          label="Audio Volume"
          value={audioState.masterVolume.value * 100}
          onChange={(value) => audioState.masterVolume.set(value / 100)}
        />
      </Section>

      {/* World & Account Section */}
      <Section>
        <ToggleItem label="Multiplayer" checked={world.value} onClick={() => world.set(!world.value)} />
        <Divider />
        <MenuItem label="Account" onClick={() => navigateTo('settings/account')} hasChevron />
        <Divider />
        <MenuItem label="Avatar" onClick={() => navigateTo('settings/avatar')} hasChevron />
      </Section>

      {/* System Section */}
      <Section>
        <MenuItem label="Controls" onClick={() => navigateTo('settings/controls')} hasChevron />
        <Divider />
        <MenuItem label="Graphics" onClick={() => navigateTo('settings/graphics')} hasChevron />
        <MenuItem label="Audio" onClick={() => navigateTo('settings/audio')} hasChevron />
        {!isGuest && <MenuItem label="Log Out" onClick={() => confirmLogout.set(true)} />}
      </Section>
    </Inner>
  )
}

export default MainMenu
