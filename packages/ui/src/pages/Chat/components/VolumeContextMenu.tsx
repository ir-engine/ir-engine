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

import { useClickOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import {
  MediaChannelState,
  PeerID,
  getMutableState,
  useHookstate,
  webcamAudioMediaChannelType
} from '@ir-engine/hyperflux'
import { VolumeMaxLg, VolumeXLg } from '@ir-engine/ui/src/icons'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface VolumeContextMenuProps {
  peerID: PeerID
  type: 'cam' | 'screen'
  position: { x: number; y: number }
  onClose: () => void
}

export const VolumeContextMenu: React.FC<VolumeContextMenuProps> = ({ peerID, type, position, onClose }) => {
  const { t } = useTranslation()
  const menuRef = useRef<HTMLDivElement>(null)
  const audioState = useHookstate(getMutableState(AudioState))

  // Determine if this is the local user
  const isSelf = peerID === Engine.instance.store.peerID || peerID === 'self'

  // Get the peer media channel state
  const audioMediaChannelState = useHookstate(getMutableState(MediaChannelState)[peerID][webcamAudioMediaChannelType])

  // Get volume from state or use default
  const [volume, setVolume] = useState(
    isSelf ? audioState.microphoneGain.value : audioMediaChannelState.element.value?.volume || 1
  )

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)

    if (isSelf) {
      // Update microphone gain for self
      getMutableState(AudioState).microphoneGain.set(newVolume)
    } else {
      // Update volume for peer's audio element
      const audioElement = audioMediaChannelState.element.value as HTMLAudioElement | null
      if (audioElement) {
        audioElement.volume = newVolume
      }
    }
  }

  // Close the menu when clicking outside
  useClickOutside(menuRef, onClose)

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-64 rounded-md bg-white p-4 shadow-lg"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          {isSelf ? t('mediaSession:mediaSession.microphoneVolume') : t('mediaSession:mediaSession.participantVolume')}
        </h3>
        {volume === 0 ? <VolumeXLg className="h-4 w-4" /> : <VolumeMaxLg className="h-4 w-4" />}
      </div>

      <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} className="w-full" />

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export default VolumeContextMenu
