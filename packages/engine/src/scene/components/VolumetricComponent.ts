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

import type VolumetricPlayer from '@etherealengine/volumetric/dist/Player'
import { useEffect } from 'react'
import { Box3, Material, Mesh, Object3D } from 'three'

import { createWorkerFromCrossOriginURL } from '@etherealengine/common/src/utils/createWorkerFromCrossOriginURL'
import { getState } from '@etherealengine/hyperflux'

import { DissolveEffect } from '@etherealengine/engine/src/avatar/DissolveEffect'
import { AvatarDissolveComponent } from '@etherealengine/engine/src/avatar/components/AvatarDissolveComponent'
import { AvatarEffectComponent, MaterialMap } from '@etherealengine/engine/src/avatar/components/AvatarEffectComponent'
import { AudioState } from '../../audio/AudioState'
import { isClient } from '../../common/functions/getEnvironment'
import { iOS } from '../../common/functions/isMobile'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { addObjectToGroup } from '../components/GroupComponent'
import { PlayMode } from '../constants/PlayMode'
import { AudioNodeGroups, MediaElementComponent, createAudioNodeGroup, getNextTrack } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'

export const VolumetricComponent = defineComponent({
  name: 'EE_volumetric',
  jsonID: 'volumetric',

  onInit: (entity) => {
    return {
      useLoadingEffect: true,
      loadingEffectTime: 0,
      loadingEffectActive: true,
      player: undefined! as VolumetricPlayer,
      paths: [] as string[],
      paused: false,
      hasTrackStopped: true,
      volume: 1,
      height: 1.6,
      playMode: PlayMode.loop as PlayMode,
      track: 0
    }
  },

  toJSON: (entity, component) => {
    return {
      useLoadingEffect: component.useLoadingEffect.value,
      paths: component.paths.value,
      paused: component.paused.value,
      volume: component.volume.value,
      playMode: component.playMode.value
    }
  },

  onSet: (entity, component, json) => {
    setComponent(entity, ShadowComponent)

    if (!json) return
    if (typeof json?.useLoadingEffect === 'boolean' && json.useLoadingEffect !== component.useLoadingEffect.value) {
      component.useLoadingEffect.set(json.useLoadingEffect)
    }

    if (typeof json.paths === 'object') {
      component.paths.set(json.paths)
    }

    if (typeof json.paused === 'boolean') component.paused.set(json.paused)

    // backwars-compat: convert from number enums to strings
    if (
      (typeof json.playMode === 'number' || typeof json.playMode === 'string') &&
      json.playMode !== component.playMode.value
    ) {
      if (typeof json.playMode === 'number') {
        switch (json.playMode) {
          case 1:
            component.playMode.set(PlayMode.single)
            break
          case 2:
            component.playMode.set(PlayMode.random)
            break
          case 3:
            component.playMode.set(PlayMode.loop)
            break
          case 4:
            component.playMode.set(PlayMode.singleloop)
            break
        }
      } else {
        component.playMode.set(json.playMode)
      }
    }
  },

  reactor: VolumetricReactor
})

export function VolumetricReactor() {
  const entity = useEntityContext()
  const audioContext = getState(AudioState).audioContext
  const gainNodeMixBuses = getState(AudioState).gainNodeMixBuses
  const volumetric = useComponent(entity, VolumetricComponent)

  useEffect(() => {
    if (isClient) {
      import('@etherealengine/volumetric/dist/Player')
        .then((module) => module.default)
        .then((VolumetricPlayer) => {
          const worker = createWorkerFromCrossOriginURL(VolumetricPlayer.defaultWorkerURL)
          setComponent(entity, MediaElementComponent, {
            element: document.createElement('video') as HTMLMediaElement
          })
          const mediaElement = getMutableComponent(entity, MediaElementComponent)
          const element = mediaElement.element.value

          element.autoplay = true
          ;(element as HTMLVideoElement).playsInline = true

          element.preload = 'auto'
          element.crossOrigin = 'anonymous'

          volumetric.player.set(
            new VolumetricPlayer({
              renderer: EngineRenderer.instance.renderer,
              onTrackEnd: () => {
                volumetric.hasTrackStopped.set(true)
                volumetric.track.set(
                  getNextTrack(volumetric.track.value, volumetric.paths.length, volumetric.playMode.value)
                )
              },
              video: element as HTMLVideoElement,
              V1Args: {
                worker: worker,
                targetFramesToRequest: iOS ? 10 : 90
              },
              paths: [],
              playMode: PlayMode.loop
            })
          )
          addObjectToGroup(entity, volumetric.player.value.mesh)

          const handleAutoplay = () => {
            if (!volumetric.player.value.paused) volumetric.player.value.play()
          }

          if (isClient) {
            window.addEventListener('pointerup', handleAutoplay)
            window.addEventListener('keypress', handleAutoplay)
            window.addEventListener('touchend', handleAutoplay)
            EngineRenderer.instance.renderer.domElement.addEventListener('pointerup', handleAutoplay)
            EngineRenderer.instance.renderer.domElement.addEventListener('touchend', handleAutoplay)
          }

          element.addEventListener('playing', () => {
            if (audioContext.state == 'suspended') {
              audioContext.resume()
            }

            window.removeEventListener('pointerup', handleAutoplay)
            window.removeEventListener('keypress', handleAutoplay)
            window.removeEventListener('touchend', handleAutoplay)
            EngineRenderer.instance.renderer.domElement.removeEventListener('pointerup', handleAutoplay)
            EngineRenderer.instance.renderer.domElement.removeEventListener('touchend', handleAutoplay)

            const transform = getComponent(entity, TransformComponent)
            if (!transform) return
            if (volumetric.loadingEffectActive.value) {
              volumetric.height.set(calculateHeight(volumetric.player.value.mesh) * transform.scale.y)
              if (volumetric.loadingEffectTime.value === 0) setupLoadingEffect(entity, volumetric.player.value!.mesh)
            }
          })

          if (!AudioNodeGroups.get(element)) {
            const source = audioContext.createMediaElementSource(element)

            if (audioContext.state == 'suspended') {
              audioContext.resume()
            }

            const audioNodes = createAudioNodeGroup(element, source, gainNodeMixBuses.soundEffects)

            audioNodes.gain.gain.setTargetAtTime(volumetric.volume.value, audioContext.currentTime, 0.1)
          }
        })
    }
  }, [])

  useEffect(
    function updateVolume() {
      const volume = volumetric.volume.value
      const element = getOptionalComponent(entity, MediaElementComponent)?.element as HTMLMediaElement
      if (!element) return
      const audioNodes = AudioNodeGroups.get(element)
      if (audioNodes) {
        audioNodes.gain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
      }
    },
    [volumetric.volume, volumetric.player]
  )

  useEffect(() => {
    if (!volumetric.player.value) return
    if (volumetric.hasTrackStopped.value) {
      // Track is changed. Set the track path
      if (volumetric.paths[volumetric.track.value].value) {
        volumetric.loadingEffectActive.set(volumetric.useLoadingEffect.value) // set to user's value
        volumetric.loadingEffectTime.set(0)
        volumetric.player.value.setTrackPath(volumetric.paths[volumetric.track.value].value)
        volumetric.hasTrackStopped.set(false)
      }
    } else {
      /** Track isn't changed. Probably new path is added or edited.
       * No need to set track path.
       */
    }
  }, [volumetric.track, volumetric.paths, volumetric.player, volumetric.hasTrackStopped])

  useEffect(() => {
    if (!volumetric.player.value) return
    if (volumetric.paused.value) {
      volumetric.player.value.pause()
    } else {
      volumetric.player.value.play()
    }
  }, [volumetric.paused, volumetric.player])

  return null
}

export const endLoadingEffect = (entity, object) => {
  if (!hasComponent(entity, AvatarEffectComponent)) return
  const plateComponent = getComponent(entity, AvatarEffectComponent)
  plateComponent.originMaterials.forEach(({ id, material }) => {
    object.traverse((obj) => {
      if (obj.uuid === id) {
        obj['material'] = material
      }
    })
  })

  let pillar: any = null!
  let plate: any = null!

  const childrens = object.children
  for (let i = 0; i < childrens.length; i++) {
    if (childrens[i].name === 'pillar_obj') pillar = childrens[i]
    if (childrens[i].name === 'plate_obj') plate = childrens[i]
  }

  if (pillar !== null) {
    pillar.traverse(function (child) {
      if (child['material']) child['material'].dispose()
    })

    pillar.parent.remove(pillar)
  }

  if (plate !== null) {
    plate.traverse(function (child) {
      if (child['material']) child['material'].dispose()
    })

    plate.parent.remove(plate)
  }

  removeComponent(entity, AvatarDissolveComponent)
  removeComponent(entity, AvatarEffectComponent)
}

const setupLoadingEffect = (entity: Entity, obj: Object3D) => {
  const materialList: Array<MaterialMap> = []
  obj.traverse((object: Mesh<any, Material>) => {
    if (object.material && object.material.clone) {
      // Transparency fix
      const material = object.material.clone()
      materialList.push({
        id: object.uuid,
        material: material
      })
      object.material = DissolveEffect.createDissolveMaterial(object as any)
    }
  })
  if (hasComponent(entity, AvatarEffectComponent)) removeComponent(entity, AvatarEffectComponent)
  const effectEntity = createEntity()
  setComponent(effectEntity, AvatarEffectComponent, {
    sourceEntity: entity,
    opacityMultiplier: 0,
    originMaterials: materialList
  })
}

const calculateHeight = (obj: Object3D) => {
  //calculate the uvol model height
  const bbox = new Box3().setFromObject(obj)
  let height = 1.5
  if (bbox.max.y != undefined && bbox.min.y != undefined) {
    height = bbox.max.y - bbox.min.y
  }
  return height
}
