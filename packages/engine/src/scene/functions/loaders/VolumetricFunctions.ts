import type VolumetricPlayer from '@xrfoundation/volumetric/player'
import { Box3, Group, Material, Mesh, Object3D } from 'three'

import { AvatarDissolveComponent } from '@xrengine/engine/src/avatar/components/AvatarDissolveComponent'
import { AvatarEffectComponent, MaterialMap } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { DissolveEffect } from '@xrengine/engine/src/avatar/DissolveEffect'

import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  SerializedComponentType
} from '../../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists } from '../../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { MediaElementComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VolumetricComponent } from '../../components/VolumetricComponent'
import { PlayMode } from '../../constants/PlayMode'

let VolumetricPlayerPromise = null! as Promise<typeof import('@xrfoundation/volumetric/player').default>

if (isClient) {
  // todo: add top-level await here to ensure it's loaded when component is created
  VolumetricPlayerPromise = import('@xrfoundation/volumetric/player').then((module) => module.default)
}

export const deserializeVolumetric: ComponentDeserializeFunction = (
  entity: Entity,
  data: SerializedComponentType<typeof VolumetricComponent>
) => {
  addComponent(entity, VolumetricComponent, data)
}

export const serializeVolumetric: ComponentSerializeFunction = (entity) => {
  return serializeComponent(entity, VolumetricComponent)
}

const Volumetric = new WeakMap<
  HTMLVideoElement,
  {
    entity: Entity
    player: VolumetricPlayer
    height: number
    loadingEffectActive: boolean
    loadingEffectTime: number
  }
>()

export const updateVolumetric = async (entity: Entity) => {
  if (!isClient) return

  const VolumetricPlayer = await VolumetricPlayerPromise
  if (!entityExists(entity)) return

  if (!hasComponent(entity, Object3DComponent)) addComponent(entity, Object3DComponent, { value: new Group() })
  const group = getComponent(entity, Object3DComponent).value

  const mediaElement = getComponent(entity, MediaElementComponent)
  const volumetricComponent = getComponent(entity, VolumetricComponent)

  if (!mediaElement || !volumetricComponent) return

  if (mediaElement.element instanceof HTMLVideoElement == false) {
    throw new Error('expected video media')
  }

  let volumetric = Volumetric.get(mediaElement.element as HTMLVideoElement)!

  if (volumetric) {
    volumetric.player.update()
    return
  }

  const player = new VolumetricPlayer({
    renderer: EngineRenderer.instance.renderer,
    video: mediaElement.element as HTMLVideoElement,
    paths: [],
    playMode: PlayMode.single
  })

  volumetric = {
    entity,
    player,
    height: 1.6,
    loadingEffectActive: volumetricComponent.useLoadingEffect.value,
    loadingEffectTime: 0
  }
  Volumetric.set(mediaElement.element as HTMLVideoElement, volumetric)

  if (player.mesh.parent !== group) group.add(player.mesh)

  player.video.addEventListener('playing', () => {
    volumetric.height = calculateHeight(player!.mesh) * group.scale.y
    if (volumetric.loadingEffectTime === 0) setupLoadingEffect(entity, player!.mesh)
  })

  player.video.addEventListener('ended', () => {
    volumetric.loadingEffectActive = volumetricComponent.useLoadingEffect.value
    volumetric.loadingEffectTime = 0
  })
}

export const updateLoadingEffect = (volumetric: NonNullable<ReturnType<typeof Volumetric.get>>) => {
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
      player.video.play()
    }
  }
}

const endLoadingEffect = (entity, object) => {
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
      object.material = DissolveEffect.getDissolveTexture(object)
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
