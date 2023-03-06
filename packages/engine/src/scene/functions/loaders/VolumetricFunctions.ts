import { Box3, Material, Mesh, Object3D } from 'three'

import { createWorkerFromCrossOriginURL } from '@etherealengine/common/src/utils/createWorkerFromCrossOriginURL'
import { AvatarDissolveComponent } from '@etherealengine/engine/src/avatar/components/AvatarDissolveComponent'
import { AvatarEffectComponent, MaterialMap } from '@etherealengine/engine/src/avatar/components/AvatarEffectComponent'
import { DissolveEffect } from '@etherealengine/engine/src/avatar/DissolveEffect'
import { getState } from '@etherealengine/hyperflux'
import type VolumetricPlayer from '@etherealengine/volumetric/player'

import { isClient } from '../../../common/functions/isClient'
import { iOS } from '../../../common/functions/isMobile'
import { EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentState,
  getOptionalComponent,
  hasComponent,
  removeComponent
} from '../../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists } from '../../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { MediaComponent, MediaElementComponent } from '../../components/MediaComponent'
import { VolumetricComponent } from '../../components/VolumetricComponent'
import { PlayMode } from '../../constants/PlayMode'

let VolumetricPlayerPromise = null! as Promise<typeof import('@etherealengine/volumetric/player').default>

if (isClient) {
  // todo: add top-level await here to ensure it's loaded when component is created
  VolumetricPlayerPromise = import('@etherealengine/volumetric/player').then((module) => module.default)
}

const Volumetric = new WeakMap<
  HTMLMediaElement,
  {
    entity: Entity
    player: VolumetricPlayer
    height: number
    loadingEffectActive: boolean
    loadingEffectTime: number
  }
>()

export const enterVolumetric = async (entity: Entity) => {
  const VolumetricPlayer = await VolumetricPlayerPromise
  if (!entityExists(entity)) return

  const mediaElement = getOptionalComponent(entity, MediaElementComponent)
  const volumetricComponent = getOptionalComponent(entity, VolumetricComponent)
  if (!mediaElement) return
  if (!volumetricComponent) return

  if (mediaElement.element instanceof HTMLVideoElement == false) {
    throw new Error('expected video media')
  }

  const worker = createWorkerFromCrossOriginURL(VolumetricPlayer.defaultWorkerURL)

  const player = new VolumetricPlayer({
    renderer: EngineRenderer.instance.renderer,
    video: mediaElement.element as HTMLVideoElement,
    paths: [],
    playMode: PlayMode.single,
    worker
    // material: isMobile new MeshBasicMaterial() ? new MeshStandardMaterial() as any // TODO - shader problems make this not work
  })

  player.targetFramesToRequest = iOS ? 10 : 90

  const volumetric = {
    entity,
    player,
    height: 1.6,
    loadingEffectActive: volumetricComponent.useLoadingEffect,
    loadingEffectTime: 0
  }
  Volumetric.set(mediaElement.element, volumetric)

  addObjectToGroup(entity, volumetric.player.mesh)

  player.video.addEventListener(
    'playing',
    () => {
      const transform = getComponent(entity, TransformComponent)
      if (!transform) return
      if (volumetric.loadingEffectActive) {
        volumetric.height = calculateHeight(player.mesh) * transform.scale.y
        if (volumetric.loadingEffectTime === 0) setupLoadingEffect(entity, player!.mesh)
      }
    },
    { signal: mediaElement.abortController.signal }
  )

  player.video.addEventListener(
    'ended',
    () => {
      volumetric.loadingEffectActive = volumetricComponent.useLoadingEffect
      volumetric.loadingEffectTime = 0
    },
    { signal: mediaElement.abortController.signal }
  )
}

export const updateVolumetric = async (entity: Entity) => {
  const mediaElement = getOptionalComponent(entity, MediaElementComponent)
  if (!mediaElement) return
  const volumetric = Volumetric.get(mediaElement.element)
  if (volumetric) {
    volumetric.player.update()
    const player = volumetric.player
    const height = volumetric.height
    const step = volumetric.height / 150
    if (volumetric.loadingEffectActive) {
      if (volumetric.loadingEffectTime <= height) {
        player.mesh.traverse((child: any) => {
          if (child['material']) {
            if (child.material.uniforms) child.material.uniforms.time.value = volumetric.loadingEffectTime
          }
        })
        volumetric.loadingEffectTime += step
      } else {
        volumetric.loadingEffectActive = false
        endLoadingEffect(volumetric.entity, player.mesh)
        const media = getComponentState(entity, MediaComponent)
        if (media.autoplay.value && getState(EngineState).userHasInteracted.value) media.paused.set(false)
      }
    }
  }
}

const endLoadingEffect = (entity, object) => {
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
      object.material = DissolveEffect.getDissolveTexture(object as any)
    }
  })
  if (hasComponent(entity, AvatarEffectComponent)) removeComponent(entity, AvatarEffectComponent)
  const effectEntity = createEntity()
  addComponent(effectEntity, AvatarEffectComponent, {
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
