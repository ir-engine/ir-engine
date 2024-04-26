/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { defineComponent, getMutableComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { v4 as uuidv4 } from 'uuid'
import { PlayMode } from '../constants/PlayMode'

export const PlaylistComponent = defineComponent({
  name: 'PlaylistComponent',
  jsonID: 'EE_playlist',

  onInit: (entity) => {
    return {
      tracks: [] as { uuid: string; src: string }[],
      currentTrackUUID: '',
      currentTrackIndex: -1,
      paused: true,
      playMode: PlayMode.loop
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.tracks) component.tracks.set(json.tracks)
    if (json.currentTrackUUID) component.currentTrackUUID.set(json.currentTrackUUID)
    if (json.playMode) component.playMode.set(json.playMode)
    if (json.paused) component.paused.set(json.paused)
  },

  toJSON: (entity, component) => {
    return {
      tracks: component.tracks.value,
      currentTrackUUID: component.currentTrackUUID.value,
      playMode: component.playMode.value,
      paused: component.paused.value
    }
  },

  playNextTrack: (entity, delta: number) => {
    const component = getMutableComponent(entity, PlaylistComponent)
    const tracksCount = component.tracks.value.length

    if (tracksCount === 0) return

    if (tracksCount === 1 || component.playMode.value === PlayMode.singleloop) {
      const newUUID = uuidv4()
      component.tracks[component.currentTrackIndex.value].uuid.set(newUUID)
      component.currentTrackUUID.set(newUUID)

      return
    }

    if (component.playMode.value === PlayMode.loop) {
      const previousTrackIndex = (component.currentTrackIndex.value + delta + tracksCount) % tracksCount
      component.currentTrackUUID.set(component.tracks[previousTrackIndex].uuid.value)
    } else if (component.playMode.value === PlayMode.random) {
      let randomIndex = (Math.floor(Math.random() * tracksCount) + tracksCount) % tracksCount

      // Ensure that the random index is different from the current track index
      while (randomIndex === component.currentTrackIndex.value) {
        randomIndex = (Math.floor(Math.random() * tracksCount) + tracksCount) % tracksCount
      }

      component.currentTrackUUID.set(component.tracks[randomIndex].uuid.value)
    }
  }
})
