import { Box3 } from 'three'

import { AvatarDissolveComponent } from '@xrengine/engine/src/avatar/components/AvatarDissolveComponent'
import { AvatarEffectComponent, MaterialMap } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { DissolveEffect } from '@xrengine/engine/src/avatar/DissolveEffect'
import { loadGrowingEffectObject } from '@xrengine/engine/src/avatar/functions/avatarFunctions'

import { AudioComponent } from '../../../audio/components/AudioComponent'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { CallbackComponent } from '../../components/CallbackComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { MediaElementComponent } from '../../components/MediaElementComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { UpdatableComponent } from '../../components/UpdatableComponent'
import {
  SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES,
  VolumetricComponent,
  VolumetricComponentType
} from '../../components/VolumetricComponent'
import { addError, removeError } from '../ErrorFunctions'
import { createAudioNode } from './AudioFunctions'

type VolumetricObject3D = UpdateableObject3D & {
  userData: {
    isEffect: boolean
    time: number
  }
  autoplay: boolean
  controls: boolean
}

let DracosisPlayer = null! as typeof import('@xrfoundation/volumetric/player').default

if (isClient) {
  Promise.all([import('@xrfoundation/volumetric/player')]).then(([module1]) => {
    DracosisPlayer = module1.default
  })
}

export const deserializeVolumetric: ComponentDeserializeFunction = (entity: Entity, data: VolumetricComponentType) => {
  try {
    removeError(entity, 'error')
    addVolumetricComponent(entity, data)
  } catch (error) {
    console.error(error)
    addError(entity, 'error', error.message)
  }
}

export const addVolumetricComponent = (entity: Entity, props: VolumetricComponentType) => {
  if (!isClient) return

  const obj3d = new UpdateableObject3D()
  addComponent(entity, Object3DComponent, { value: obj3d })
  addComponent(entity, UpdatableComponent, true)
  const mediaComponent = getComponent(entity, MediaComponent)
  const audioComponent = getComponent(entity, AudioComponent)

  let height = 0
  let step = 0.001

  const properties = parseVolumetricProperties(props)

  const player = new DracosisPlayer({
    renderer: EngineRenderer.instance.renderer,
    // https://github.com/XRFoundation/Universal-Volumetric/issues/117
    paths: mediaComponent.paths.length ? mediaComponent.paths : ['fake-path'],
    playMode: mediaComponent.playMode as any
  })

  player.video.addEventListener('play', () => {
    height = calculateHeight(obj3d)
    height = height * obj3d.scale.y + 1
    step = height / 150
    setupLoadingEffect(entity, obj3d)
    obj3d.userData.isEffect = true
    obj3d.userData.time = 0
  })

  obj3d.add(player.mesh)

  addComponent(entity, VolumetricComponent, {
    player,
    ...properties
  })

  // TODO: move to CallbackComponent
  obj3d.update = () => {
    if (!getEngineState().userHasInteracted.value) return
    player?.update()
    if (obj3d.userData.isEffect) {
      if (obj3d.userData.time <= height) {
        obj3d.traverse((child: any) => {
          if (child['material']) {
            if (child.material.uniforms) child.material.uniforms.time.value = obj3d.userData.time
          }
        })

        obj3d.userData.time += step
      } else {
        obj3d.userData.isEffect = false
        endLoadingEffect(entity, obj3d)
        player.video.play()
      }
    }
  }

  addComponent(entity, CallbackComponent, {
    play: () => player.video.play(),
    pause: () => player.video.pause()
  })

  const el = player.video
  el.autoplay = mediaComponent.autoplay

  el.addEventListener('playing', () => {
    mediaComponent.playing = true
  })

  el.addEventListener('pause', () => {
    mediaComponent.playing = false
  })

  if (el.autoplay) {
    if (getEngineState().userHasInteracted.value) {
      player.video.play()
    }
  }

  addComponent(entity, MediaElementComponent, el)

  createAudioNode(
    el,
    Engine.instance.audioContext.createMediaElementSource(el),
    audioComponent.isMusic ? Engine.instance.gainNodeMixBuses.music : Engine.instance.gainNodeMixBuses.soundEffects
  )
}

export const updateVolumetric: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value as VolumetricObject3D
  const { player } = getComponent(entity, VolumetricComponent)
  const mediaComponent = getComponent(entity, MediaComponent)

  const paths = mediaComponent.paths.filter((p) => p)

  if (paths.length && JSON.stringify(player.paths) !== JSON.stringify(paths)) {
    player.paths = paths
  }

  obj3d.autoplay = mediaComponent.autoplay
  obj3d.controls = mediaComponent.controls
}

export const serializeVolumetric: ComponentSerializeFunction = (entity) => {
  const vol = getComponent(entity, VolumetricComponent)
  return {
    useLoadingEffect: vol.useLoadingEffect
  }
}

export const prepareVolumetricForGLTFExport: ComponentPrepareForGLTFExportFunction = (video) => {
  if (video.userData.player) {
    video.userData.player.dispose()
    delete video.userData.player
  }
}

const parseVolumetricProperties = (props: Partial<VolumetricComponentType>) => {
  return {
    useLoadingEffect: props.useLoadingEffect ?? SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES.useLoadingEffect
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

const setupLoadingEffect = (entity, obj) => {
  const materialList: Array<MaterialMap> = []
  obj.traverse((object) => {
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
  loadGrowingEffectObject(entity, materialList)
}

const calculateHeight = (obj3d) => {
  let childObject
  obj3d.children.forEach((child) => {
    if (!childObject && (child.type == 'Group' || child.type == 'Object3D' || child.type == 'Mesh')) {
      childObject = child
    }
  })

  //calculate the uvol model height
  const bbox = new Box3().setFromObject(childObject)
  let height = 1
  if (bbox.max.y != undefined && bbox.min.y != undefined) {
    height = bbox.max.y - bbox.min.y
  }
  return height
}
