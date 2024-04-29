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
  AnimationSystemGroup,
  defineComponent,
  hasComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useExecute,
  useOptionalComponent
} from '@etherealengine/ecs'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { useEffect } from 'react'
import {
  BufferInfo,
  GeometryFormatToType,
  GeometryType,
  PlayerManifest as ManifestSchema,
  OldManifestSchema,
  Pretrackbufferingcallback,
  TextureType
} from '../constants/NewUVOLTypes'
import { addError, clearErrors } from '../functions/ErrorFunctions'
import BufferDataContainer from '../util/BufferDataContainer'
import { PlaylistComponent } from './PlaylistComponent'

export const NewVolumetricComponent = defineComponent({
  name: 'NewVolumetricComponent',
  jsonID: 'EE_NewVolumetric',
  onInit: (entity) => ({
    useVideoTexture: false, // legacy for UVOL1
    useLoadingEffect: true,
    hasAudio: false,
    volume: 1,
    manifest: {} as OldManifestSchema | ManifestSchema | Record<string, never>,
    time: {
      start: 0,
      checkpointAbsolute: -1,
      checkpointRelative: 0
    },
    geometry: {
      bufferData: new BufferDataContainer(),
      initialBufferLoaded: false,
      firstFrameLoaded: false
    } as BufferInfo,
    geometryType: undefined as unknown as GeometryType,
    texture: {} as Partial<Record<TextureType, BufferInfo>>,
    textureInfo: {
      textureTypes: [] as TextureType[],
      initialBufferLoaded: {} as Partial<Record<TextureType, boolean>>,
      firstFrameLoaded: {} as Partial<Record<TextureType, boolean>>
    },
    paused: true,
    preTrackBufferingCallback: undefined as undefined | Pretrackbufferingcallback
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
  errors: ['INVALID_TRACK', 'GEOMETRY_ERROR', 'TEXTURE_ERROR', 'UNKNOWN_ERROR'],
  reactor: NewVolumetricComponentReactor
})

function NewVolumetricComponentReactor() {
  const entity = useEntityContext()
  const playlistComponent = useOptionalComponent(entity, PlaylistComponent)
  const component = useComponent(entity, NewVolumetricComponent)

  useEffect(() => {
    if (!hasComponent(entity, PlaylistComponent)) {
      setComponent(entity, PlaylistComponent)
    }
    if (!hasComponent(entity, GroupComponent)) {
      setComponent(entity, GroupComponent)
    }
  }, [])

  const cleanupTrack = () => {
    component.merge({
      time: {
        start: 0,
        checkpointAbsolute: -1,
        checkpointRelative: 0
      },
      paused: true
    })

    // TODO: Dispose buffers before removing the data about the buffers

    component.geometry.merge({
      initialBufferLoaded: false,
      firstFrameLoaded: false
    })
    component.geometryType.set(undefined as unknown as GeometryType)

    component.texture.set({})
    component.textureInfo.merge({
      textureTypes: [],
      initialBufferLoaded: {},
      firstFrameLoaded: {}
    })

    clearErrors(entity, NewVolumetricComponent)
  }

  const readManifest = (manifest: OldManifestSchema | ManifestSchema) => {
    try {
      if (!manifest) {
        addError(entity, NewVolumetricComponent, 'INVALID_TRACK', 'Manifest is empty')
        return false
      }

      if (
        (manifest as OldManifestSchema).frameData !== undefined &&
        (manifest as OldManifestSchema).frameRate !== undefined
      ) {
        component.useVideoTexture.set(true)
        component.geometryType.set(GeometryType.Corto)
        component.textureInfo.textureTypes.set(['baseColor'])
      } else if ((manifest as ManifestSchema).duration !== undefined) {
        const _manifest = manifest as ManifestSchema
        if (_manifest.duration <= 0 || _manifest.duration > 10800) {
          addError(entity, NewVolumetricComponent, 'INVALID_TRACK', `Invalid duration: ${_manifest.duration}`)
          return false
        }

        component.useVideoTexture.set(false)
        const geometryTargets = Object.keys(_manifest.geometry.targets)
        if (geometryTargets.length === 0) {
          addError(entity, NewVolumetricComponent, 'GEOMETRY_ERROR', 'No geometry targets found')
          return false
        }
        const geometryType = GeometryFormatToType[_manifest.geometry.targets[geometryTargets[0]].format]
        if (geometryType === undefined) {
          addError(entity, NewVolumetricComponent, 'GEOMETRY_ERROR', 'Invalid geometry format')
          return false
        }
        component.geometryType.set(geometryType)

        const textureTypes = Object.keys(_manifest.texture) as TextureType[]
        if (textureTypes.length === 0) {
          addError(entity, NewVolumetricComponent, 'TEXTURE_ERROR', 'No texture types found')
          return false
        }
        if (!textureTypes.includes('baseColor')) {
          addError(entity, NewVolumetricComponent, 'TEXTURE_ERROR', 'No baseColor texture found')
          return false
        }

        component.textureInfo.textureTypes.set(textureTypes)
        textureTypes.forEach((textureType) => {
          component.texture.set({
            [textureType]: {
              bufferData: new BufferDataContainer(),
              initialBufferLoaded: false,
              firstFrameLoaded: false
            }
          })
        })
      }
    } catch (err) {
      addError(entity, NewVolumetricComponent, 'UNKNOWN_ERROR', 'Error in reading the manifest')
      console.error('Error in reading the manifest: ', err)
      return false
    }

    clearErrors(entity, NewVolumetricComponent)
    console.log('Manifest read successfully')
    return true
  }

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
        if (!readManifest(data)) {
          return
        }
      })
      .catch((err) => {
        addError(entity, NewVolumetricComponent, 'INVALID_TRACK', 'Error in loading the manifest')
        console.error(`Error in loading the manifest: ${track.src}: `, err)
      })
  }, [playlistComponent?.currentTrackUUID])

  useEffect(() => {
    const now = Date.now()

    if (!playlistComponent || playlistComponent?.paused.value) {
      component.paused.set(true)
      const currentCheckpointAbsolute = component.time.checkpointAbsolute.value

      const currentTimeRelative =
        currentCheckpointAbsolute !== -1
          ? component.time.checkpointRelative.value + now - currentCheckpointAbsolute
          : component.time.start.value
      const newCheckpointAbsolute = now

      component.time.merge({
        checkpointAbsolute: newCheckpointAbsolute,
        checkpointRelative: currentTimeRelative
      })
    } else {
      const currentTimeAbs = now
      component.time.checkpointAbsolute.set(currentTimeAbs)
      component.paused.set(false)
    }
  }, [playlistComponent?.paused])

  useExecute(
    () => {
      const now = Date.now()
      const currentTime = component.paused.value
        ? component.time.checkpointRelative.value
        : component.time.checkpointRelative.value + now - component.time.checkpointAbsolute.value
    },
    {
      with: AnimationSystemGroup
    }
  )

  return null
}
