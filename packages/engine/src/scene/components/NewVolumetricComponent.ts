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

import {
  defineComponent,
  hasComponent,
  setComponent,
  useEntityContext,
  useOptionalComponent
} from '@etherealengine/ecs'
import { useHookstate } from '@etherealengine/hyperflux'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { useEffect } from 'react'
import { PlayerManifest as ManifestSchema, OldManifestSchema } from '../constants/NewUVOLTypes'
import { addError, removeError } from '../functions/ErrorFunctions'
import { PlaylistComponent } from './PlaylistComponent'

export const NewVolumetricComponent = defineComponent({
  name: 'NewVolumetricComponent',
  jsonID: 'EE_NewVolumetric',
  onInit: (entity) => ({
    useVideoTexture: false,
    useLoadingEffect: true,
    hasAudio: false,
    volume: 1
  }),
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.useVideoTexture === 'boolean') {
      component.useVideoTexture.set(json.useVideoTexture)
    }
    if (typeof json.useLoadingEffect === 'boolean') {
      component.useLoadingEffect.set(json.useLoadingEffect)
    }
    if (typeof json.hasAudio === 'boolean') {
      component.hasAudio.set(json.hasAudio)
    }
    if (typeof json.volume === 'number') {
      component.volume.set(json.volume)
    }
  },
  toJSON: (entity, component) => ({
    useVideoTexture: component.useVideoTexture.value,
    useLoadingEffect: component.useLoadingEffect.value,
    hasAudio: component.hasAudio.value,
    volume: component.volume.value
  }),
  errors: ['INVALID_TRACK'],
  reactor: NewVolumetricComponentReactor
})

function NewVolumetricComponentReactor() {
  const entity = useEntityContext()
  const playlistComponent = useOptionalComponent(entity, PlaylistComponent)
  const manifest = useHookstate<OldManifestSchema | ManifestSchema | Record<string, never>>({})

  useEffect(() => {
    if (!hasComponent(entity, PlaylistComponent)) {
      setComponent(entity, PlaylistComponent)
    }
    if (!hasComponent(entity, GroupComponent)) {
      setComponent(entity, GroupComponent)
    }
  }, [])

  const cleanupTrack = () => {}

  useEffect(() => {
    cleanupTrack()
    if (!playlistComponent?.currentTrackUUID.value) {
      return
    }
    const track = playlistComponent.tracks.value.find(
      (track) => track.uuid === playlistComponent.currentTrackUUID.value
    )
    if (!track || !track.src) {
      addError(entity, NewVolumetricComponent, 'INVALID_TRACK', 'Track source is empty')
      return
    }

    fetch(track.src)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Unable to load the manifest: ${resp.statusText}`)
        }

        return resp.json()
      })
      .then((data) => {
        if ((data.frameData && data.frameRate) || data.duration) {
          removeError(entity, NewVolumetricComponent, 'INVALID_TRACK')
          manifest.set(data)
          console.info('Manifest loaded: ', data)
        } else {
          throw new Error('Invalid manifest format')
        }
      })
      .catch((err) => {
        addError(entity, NewVolumetricComponent, 'INVALID_TRACK', 'Error in loading the manifest')
        console.error(`Error in loading the manifest: ${track.src}: `, err)
        return
      })
  }, [playlistComponent?.currentTrackUUID])

  useEffect(() => {
    console.log('Paused: ', playlistComponent?.paused.value)
  }, [playlistComponent?.paused])

  return null
}
