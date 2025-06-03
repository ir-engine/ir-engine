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

import React, { useState } from 'react'

import { useHookstate } from '@hookstate/core'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { AuthService } from '../../user/services/AuthService'
import { MenuItem } from './MenuItem'
import { Section } from './Section'
import SliderItem from './SliderItem'
import ToggleItem from './ToggleItem'

// Define types for screen components
interface ScreenProps {
  navigateTo: (screenKey: string, historyKey: string) => void
  navigateClose?: () => void
}

const MainMenu: React.FC<ScreenProps> = ({ navigateTo }) => {
  const [videoCommunication, setVideoCommunication] = useState(false)
  const [spatialAudio, setSpatialAudio] = useState(false)
  const [multiplayer, setMultiplayer] = useState(false)
  const micVolume = useHookstate(30)
  const audioVolume = useHookstate(70)

  return (
    <div className="space-y-4">
      {/* Communication Section */}
      <Section>
        <MenuItem label="Share Space" onClick={() => navigateTo('Settings', 'shareSpace')} hasChevron />
        <Divider />
        <ToggleItem
          label="Video Communication"
          checked={videoCommunication}
          onClick={() => setVideoCommunication(!videoCommunication)}
        />
      </Section>
      <Section>
        <ToggleItem label="Spatial Audio" checked={spatialAudio} onClick={() => setSpatialAudio(!spatialAudio)} />
        <Divider />
        <SliderItem label="Mic Volume" defaultValue={micVolume.get()} onChange={(value) => micVolume.set(value)} />
        <Divider />
        <SliderItem
          label="Audio Volume"
          defaultValue={audioVolume.get()}
          onChange={(value) => audioVolume.set(value)}
        />
      </Section>

      {/* World & Account Section */}
      <Section>
        <MenuItem label="World" onClick={() => navigateTo('Settings', 'world')} hasChevron />
        <Divider />
        <ToggleItem label="Multiplayer" checked={multiplayer} onClick={() => setMultiplayer(!multiplayer)} />
        <Divider />
        <MenuItem label="Account" onClick={() => navigateTo('Settings', 'account')} hasChevron />
        <Divider />
        <MenuItem label="Avatar" onClick={() => navigateTo('Settings', 'avatar')} hasChevron />
      </Section>

      {/* System Section */}
      <Section>
        <MenuItem label="Controls" onClick={() => navigateTo('Settings', 'controls')} hasChevron />
        <Divider />
        <MenuItem label="Graphics" onClick={() => navigateTo('Settings', 'graphics')} hasChevron />
        <MenuItem label="Log Out" onClick={AuthService.logoutUser} />
      </Section>
    </div>
  )
}

export default MainMenu
