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

import { useEffect } from 'react'
import { defineState, getMutableState, useMutableState } from '../functions/StateFunctions'
import { PeerID } from '../types/Types'

export const AudioDuckingState = defineState({
  name: 'AudioDuckingState',
  initial: () => ({
    duckingModifier: 0.3,
    events: new Set<PeerID>()
  }),

  addEvent: (peerID: PeerID) => {
    getMutableState(AudioDuckingState).events.set((prev) => {
      prev.add(peerID)
      return prev
    })
  },

  removeEvent: (peerID: PeerID) => {
    getMutableState(AudioDuckingState).events.set((prev) => {
      prev.delete(peerID)
      return prev
    })
  },

  useDuckAudioEnabled: (): boolean => {
    const state = useMutableState(AudioDuckingState)
    return state.events.value.size > 0
  },

  useAudioDucking: (element: HTMLMediaElement) => {
    const state = useMutableState(AudioDuckingState)
    const duckingEnabled = AudioDuckingState.useDuckAudioEnabled()

    useEffect(() => {
      if (!element || !duckingEnabled) return

      const prevVolume = element.volume
      element.volume = prevVolume * state.duckingModifier.value
      return () => {
        element.volume = prevVolume
      }
    }, [duckingEnabled, state.duckingModifier.value])
  }
})
