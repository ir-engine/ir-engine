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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { MediaStreamState, useMutableState } from '@ir-engine/hyperflux'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import React from 'react'
import { Section } from './Section'
import ToggleItem from './ToggleItem'

interface PermissionsScreenProps {
  navigateTo: (screen: string) => void
}

const PermissionsScreen: React.FC<PermissionsScreenProps> = () => {
  const { microphoneEnabled, webcamEnabled } = useMutableState(MediaStreamState)

  return (
    <div className="flex h-full flex-col justify-between space-y-6">
      {/* Permissions Section */}
      <div className="space-y-4">
        <Section>
          <ToggleItem
            label="Camera"
            checked={webcamEnabled.value}
            onClick={() => {
              webcamEnabled.set(!webcamEnabled.value)
            }}
          />
          <Divider />
          <ToggleItem
            label="Microphone"
            checked={microphoneEnabled.value}
            onClick={() => {
              microphoneEnabled.set(!microphoneEnabled.value)
            }}
          />
        </Section>
      </div>
    </div>
  )
}

export default PermissionsScreen
