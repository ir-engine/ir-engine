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
  removeComponent,
  setComponent,
  useComponent,
  useEntityContext,
  useExecute,
  useOptionalComponent
} from '@etherealengine/ecs'
import { NO_PROXY, State, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { removeObjectFromGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { useEffect, useRef } from 'react'
import {
  BufferGeometry,
  CompressedTexture,
  Group,
  Material,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  Vector2
} from 'three'
import { CORTOLoader } from '../../assets/loaders/corto/CORTOLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import {
  BufferInfo,
  DRACOTarget,
  GLBTarget,
  GeometryFormatToType,
  GeometryType,
  KeyframeAttribute,
  PlayerManifest as ManifestSchema,
  OldManifestSchema,
  Pretrackbufferingcallback,
  TextureType,
  UniformSolveEncodeOptions,
  UniformSolveTarget
} from '../constants/NewUVOLTypes'
import { addError, clearErrors } from '../functions/ErrorFunctions'
import BufferDataContainer from '../util/BufferDataContainer'
import { fetchGeometry, fetchTextures } from '../util/VolumetricBufferingUtils'
import {
  GetGeometryProps,
  createMaterial,
  getGeometry,
  getResourceURL,
  getSortedSupportedTargets
} from '../util/VolumetricUtils'
import { MediaElementComponent } from './MediaComponent'
import { PlaylistComponent } from './PlaylistComponent'

export const NewVolumetricComponent = defineComponent({
  name: 'NewVolumetricComponent',
  jsonID: 'EE_NewVolumetric',
  onInit: (entity) => ({
    useVideoTextureForBaseColor: false, // legacy for UVOL1
    useLoadingEffect: true,
    hasAudio: false,
    volume: 1,
    manifest: {} as OldManifestSchema | ManifestSchema | Record<string, never>,
    time: {
      start: 0,
      checkpointAbsolute: -1,
      checkpointRelative: 0,
      currentTime: 0
    },
    geometry: {
      bufferData: new BufferDataContainer(),
      targets: [],
      initialBufferLoaded: false,
      firstFrameLoaded: false,
      currentTarget: 0,
      userTarget: -1
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
    if (typeof json.useVideoTextureForBaseColor === 'boolean') {
      component.useVideoTextureForBaseColor.set(json.useVideoTextureForBaseColor)
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
    useVideoTexture: component.useVideoTextureForBaseColor.value,
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
  const material = useRef<ShaderMaterial | null>(null)
  const mesh = useRef<Mesh<BufferGeometry, ShaderMaterial> | null>(null)
  const group = useRef(new Group())
  const setIntervalId = useHookstate(-1)
  const geometryBuffer = useRef(
    new Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>()
  )
  const textureBuffer = useRef(new Map<string, Map<string, CompressedTexture[]>>())
  const mediaElement = useOptionalComponent(entity, MediaElementComponent)

  // Used by GeometryType.GLTF
  const repeat = useRef(new Vector2(1, 1))
  const offset = useRef(new Vector2(0, 0))

  const bufferLoop = () => {
    const currentTimeInMS = component.time.currentTime.value
    const geometryTarget = component.geometry.targets[component.geometry.currentTarget.value].value
    const manifest = component.manifest.get(NO_PROXY)
    const geometryType = component.geometryType.value
    const manifestPath = playlistComponent?.tracks.value.find(
      (track) => track.uuid === playlistComponent.currentTrackUUID.value
    )?.src!
    const geometryBufferData = component.geometry.bufferData.get(NO_PROXY)

    fetchGeometry({
      currentTimeInMS,
      bufferData: geometryBufferData,
      target: geometryTarget,
      manifest,
      geometryType,
      manifestPath,
      geometryBuffer: geometryBuffer.current
    })
    if (!component.useVideoTextureForBaseColor.value) {
      component.textureInfo.textureTypes.value.forEach((textureType) => {
        const textureInfo = component.texture[textureType].get(NO_PROXY)
        if (textureInfo) {
          const bufferData = textureInfo.bufferData
          const target = textureInfo.targets[textureInfo.currentTarget]
          fetchTextures({
            currentTimeInMS,
            bufferData,
            target,
            manifest,
            textureType,
            manifestPath,
            textureBuffer: textureBuffer.current
          })
        }
      })
    }
  }

  useEffect(() => {
    if (!hasComponent(entity, PlaylistComponent)) {
      setComponent(entity, PlaylistComponent)
    }

    return () => {
      cleanupTrack()
      removeObjectFromGroup(entity, group.current)
    }
  }, [])

  const cleanupTrack = () => {
    removeComponent(entity, MediaElementComponent)
    clearInterval(setIntervalId.value)
    if (mesh.current) {
      group.current.remove(mesh.current)
    }

    if (hasComponent(entity, NewVolumetricComponent)) {
      setIntervalId.set(-1)
      component.merge({
        manifest: {},
        time: {
          start: 0,
          checkpointAbsolute: -1,
          checkpointRelative: 0,
          currentTime: 0
        },
        paused: true,
        hasAudio: false,
        useVideoTextureForBaseColor: false
      })
    }

    // TODO: Dispose buffers before removing the data about the buffers

    if (hasComponent(entity, NewVolumetricComponent)) {
      component.geometry.merge({
        initialBufferLoaded: false,
        firstFrameLoaded: false,
        targets: []
      })
      component.geometryType.set(undefined as unknown as GeometryType)

      component.texture.set({})
      component.textureInfo.merge({
        textureTypes: [],
        initialBufferLoaded: {},
        firstFrameLoaded: {}
      })
    }

    // TODO: Dispose all textures before disposing the material
    if (material.current) {
      material.current.dispose()
    }

    if (mesh.current) {
      mesh.current.geometry.dispose()
    }

    if (hasComponent(entity, NewVolumetricComponent)) {
      clearErrors(entity, NewVolumetricComponent)
    }
  }

  const validateManifest = (manifest: OldManifestSchema | ManifestSchema) => {
    try {
      if (!manifest) {
        addError(entity, NewVolumetricComponent, 'INVALID_TRACK', 'Manifest is empty')
        return false
      }

      if (
        (manifest as OldManifestSchema).frameData !== undefined &&
        (manifest as OldManifestSchema).frameRate !== undefined
      ) {
        setComponent(entity, MediaElementComponent)
        component.useVideoTextureForBaseColor.set(true)
        component.geometryType.set(GeometryType.Corto)
        component.textureInfo.textureTypes.set(['baseColor'])
        component.texture.set({
          baseColor: {
            bufferData: undefined as unknown as BufferDataContainer, // VideoTexture does not require BufferDataContainer
            targets: [],
            initialBufferLoaded: false,
            firstFrameLoaded: false,
            currentTarget: 0,
            userTarget: -1
          }
        })
        component.geometry.targets.set(['corto'])
        if (!getState(AssetLoaderState).cortoLoader) {
          const loader = new CORTOLoader()
          loader.setDecoderPath(getState(EngineState).publicPath + '/loader_decoders/')
          loader.preload()
          const assetLoaderState = getMutableState(AssetLoaderState)
          assetLoaderState.cortoLoader.set(loader)
        }
      } else if ((manifest as ManifestSchema).duration !== undefined) {
        const _manifest = manifest as ManifestSchema
        if (_manifest.duration <= 0 || _manifest.duration > 10800) {
          addError(entity, NewVolumetricComponent, 'INVALID_TRACK', `Invalid duration: ${_manifest.duration}`)
          return false
        }

        component.useVideoTextureForBaseColor.set(false)
        const geometryTargets = Object.keys(_manifest.geometry.targets)
        if (geometryTargets.length === 0) {
          addError(entity, NewVolumetricComponent, 'GEOMETRY_ERROR', 'No geometry targets found')
          return false
        } else {
          geometryTargets.sort((a, b) => {
            const aData = _manifest.geometry.targets[a]
            const bData = _manifest.geometry.targets[b]

            // @ts-ignore
            const aSimplificationRatio = aData.settings.simplificationRatio ?? 1

            // @ts-ignore
            const bSimplificationRatio = bData.settings.simplificationRatio ?? 1

            const aMetric = aData.frameRate * aSimplificationRatio
            const bMetric = bData.frameRate * bSimplificationRatio
            return aMetric - bMetric
          })
          geometryTargets.forEach((target, index) => {
            _manifest.geometry.targets[target].priority = index
          })
          component.geometry.targets.set(geometryTargets)
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
          const targets = _manifest.texture[textureType]?.targets
          if (targets) {
            const targetKeys = Object.keys(targets)
            if (targetKeys.length === 0) {
              addError(
                entity,
                NewVolumetricComponent,
                'TEXTURE_ERROR',
                `No texture targets found for type: ${textureType}`
              )
              return false
            }

            const supportedTargets = getSortedSupportedTargets(targets)
            supportedTargets.forEach((target, index) => {
              targets[target].priority = index
            })

            component.texture.set({
              [textureType]: {
                bufferData: new BufferDataContainer(),
                targets: supportedTargets,
                initialBufferLoaded: false,
                firstFrameLoaded: false,
                currentTarget: 0,
                userTarget: -1
              } as BufferInfo
            })
          } else {
            addError(
              entity,
              NewVolumetricComponent,
              'TEXTURE_ERROR',
              `No texture targets found for type: ${textureType}`
            )
            return false
          }
        })
      }
    } catch (err) {
      addError(entity, NewVolumetricComponent, 'UNKNOWN_ERROR', 'Error in reading the manifest')
      console.error('Error in reading the manifest: ', err)
      return false
    }

    clearErrors(entity, NewVolumetricComponent)
    console.log('Manifest read successfully')
    return manifest
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

    let trackSource = track.src
    if (track.src.endsWith('.mp4')) {
      trackSource = track.src.replace('.mp4', '.manifest')
    }

    fetch(trackSource)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`Unable to load the manifest: ${resp.statusText}`)
        }

        return resp.json()
      })
      .then((data) => {
        const manifest = validateManifest(data)

        if (!manifest) {
          return
        }
        component.manifest.set(data)

        const preTrackBufferingCallback = component.preTrackBufferingCallback.value
        if (preTrackBufferingCallback) {
          preTrackBufferingCallback(component)
        }
        component.time.currentTime.set(component.time.start.value)
        const firstGeometryTarget =
          component.geometryType.value !== GeometryType.Corto ? component.geometry.targets[0].value : ''

        const hasNormals =
          component.geometryType.value === GeometryType.Unify &&
          !((manifest as ManifestSchema).geometry.targets[firstGeometryTarget].settings as UniformSolveEncodeOptions)
            .excludeNormals

        const overrideMaterialProperties =
          component.geometryType.value !== GeometryType.Corto
            ? (manifest as ManifestSchema).materialProperties
            : undefined

        material.current = createMaterial(
          component.geometryType.value,
          component.useVideoTextureForBaseColor.value,
          hasNormals,
          component.textureInfo.textureTypes.value,
          // @ts-ignore
          overrideMaterialProperties
        )
        mesh.current = new Mesh(new SphereGeometry(3, 32, 32) as BufferGeometry, material.current)
        group.current.add(mesh.current)

        console.log('Material created successfully: ', material.current)

        const intervalId = setInterval(bufferLoop, 500)
        setIntervalId.set(intervalId as unknown as number)

        if (
          (component.useVideoTextureForBaseColor.value ||
            (component.hasAudio.value && (manifest as ManifestSchema).audio)) &&
          mediaElement
        ) {
          const element = mediaElement.element.get(NO_PROXY)
          if (component.useVideoTextureForBaseColor.value) {
            element.src = track.src.replace('.manifest', '.mp4')
          } else if (component.hasAudio.value && (manifest as ManifestSchema).audio) {
            const audioData = (manifest as ManifestSchema).audio!
            element.src = getResourceURL({
              type: 'audio',
              manifestPath: track.src,
              path: audioData.path,
              format: audioData.formats[0]
            })
          }
          element.currentTime = component.time.currentTime.value / 1000
          element.load()
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
      if (mediaElement) {
        const element = mediaElement.element.get(NO_PROXY)
        element.pause()
      }

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
      if (mediaElement) {
        const element = mediaElement.element.get(NO_PROXY)
        element.play()
      }
      component.paused.set(false)
    }
  }, [playlistComponent?.paused, mediaElement])

  const updateGeometry = (currentTimeInMS: number) => {
    const geometryType = component.geometryType.value
    const geometryTarget = component.geometry.targets[component.geometry.currentTarget.value].value
    const targetData =
      component.geometryType.value !== GeometryType.Corto
        ? (component.manifest as State<ManifestSchema>).geometry.targets.get(NO_PROXY)
        : undefined
    const frameRate =
      component.geometryType.value === GeometryType.Corto
        ? (component.manifest as State<OldManifestSchema>).frameRate.get(NO_PROXY)
        : undefined

    const result = getGeometry({
      geometryBuffer: geometryBuffer.current,
      currentTimeInMS,
      preferredTarget: geometryTarget,
      geometryType,
      targets: component.geometry.targets.value,
      ...(geometryType === GeometryType.Corto && { frameRate: frameRate as number }),
      ...(geometryType !== GeometryType.Corto && {
        targetData: targetData as Record<string, DRACOTarget | GLBTarget | UniformSolveTarget>
      }),
      ...(geometryType === GeometryType.Unify && { keyframeName: 'keyframeA' })
    } as GetGeometryProps)

    if (!result) {
      if (geometryType !== GeometryType.Unify) {
        console.warn('Geometry frame not found at time: ', currentTimeInMS / 1000)
        return
      }
    } else {
      if (geometryType === GeometryType.Corto || geometryType === GeometryType.Draco) {
        const geometry = result.geometry as BufferGeometry
        for (const attribute in geometry.attributes) {
          if (mesh.current!.geometry.attributes[attribute] !== geometry.attributes[attribute]) {
            mesh.current!.geometry.attributes[attribute] = geometry.attributes[attribute]
            mesh.current!.geometry.attributes[attribute].needsUpdate = true
          }
        }
      } else if (geometryType === GeometryType.GLTF) {
        console.log('NOT IMPLEMENTED')
      }
    }

    if (geometryType === GeometryType.Unify) {
      const keyframeAResult = result as
        | {
            geometry: KeyframeAttribute
            index: number
            target: string
          }
        | false
      const keyframeBResult = getGeometry({
        geometryBuffer: geometryBuffer.current,
        currentTimeInMS,
        preferredTarget: geometryTarget,
        geometryType,
        targets: component.geometry.targets.value,
        targetData: targetData as Record<string, DRACOTarget | GLBTarget | UniformSolveTarget>,
        ...(geometryType === GeometryType.Unify && { keyframeName: 'keyframeB' })
      } as GetGeometryProps) as
        | {
            geometry: KeyframeAttribute
            index: number
            target: string
          }
        | false

      if (keyframeAResult) {
        if (mesh.current!.geometry.attributes['keyframeAPosition'] !== keyframeAResult.geometry.position) {
          mesh.current!.geometry.attributes['keyframeAPosition'] = keyframeAResult.geometry.position
          mesh.current!.geometry.attributes['keyframeAPosition'].needsUpdate = true
        }
        if (
          keyframeAResult.geometry.normal &&
          mesh.current!.geometry.attributes['keyframeANormal'] !== keyframeAResult.geometry.normal
        ) {
          mesh.current!.geometry.attributes['keyframeANormal'] = keyframeAResult.geometry.normal
          mesh.current!.geometry.attributes['keyframeANormal'].needsUpdate = true
        }
      }
      if (keyframeBResult) {
        if (mesh.current!.geometry.attributes['keyframeBPosition'] !== keyframeBResult.geometry.position) {
          mesh.current!.geometry.attributes['keyframeBPosition'] = keyframeBResult.geometry.position
          mesh.current!.geometry.attributes['keyframeBPosition'].needsUpdate = true
        }
        if (
          keyframeBResult.geometry.normal &&
          mesh.current!.geometry.attributes['keyframeBNormal'] !== keyframeBResult.geometry.normal
        ) {
          mesh.current!.geometry.attributes['keyframeBNormal'] = keyframeBResult.geometry.normal
          mesh.current!.geometry.attributes['keyframeBNormal'].needsUpdate = true
        }
      }

      if (!keyframeAResult && !keyframeBResult) {
        return
      } else if (!keyframeAResult && keyframeBResult) {
        mesh.current!.material.uniforms.mixRatio.value = 1
      } else if (keyframeAResult && !keyframeBResult) {
        mesh.current!.material.uniforms.mixRatio.value = 0
      } else if (keyframeAResult && keyframeBResult) {
        const keyframeATimeInMS = (keyframeAResult.index * 1000) / targetData![keyframeAResult.target].frameRate
        const keyframeBTimeInMS = (keyframeBResult.index * 1000) / targetData![keyframeBResult.target].frameRate
        const distanceFromA = Math.abs(currentTimeInMS - keyframeATimeInMS)
        const distanceFromB = Math.abs(currentTimeInMS - keyframeBTimeInMS)
        const mixRatio = distanceFromA + distanceFromB > 0 ? distanceFromA / (distanceFromA + distanceFromB) : 0.5
        mesh.current!.material.uniforms.mixRatio.value = mixRatio
      }
    }
  }

  useExecute(
    () => {
      const now = Date.now()
      let __currentTime = component.time.currentTime.value

      if ((component.useVideoTextureForBaseColor.value || component.hasAudio.value) && mediaElement) {
        const element = mediaElement.element.get(NO_PROXY)!
        __currentTime = element.currentTime * 1000
      } else {
        __currentTime = component.paused.value
          ? component.time.checkpointRelative.value
          : component.time.checkpointRelative.value + now - component.time.checkpointAbsolute.value
      }
      const currentTime = __currentTime
      component.time.currentTime.set(currentTime)
      updateGeometry(__currentTime)
    },
    {
      with: AnimationSystemGroup
    }
  )

  return null
}
