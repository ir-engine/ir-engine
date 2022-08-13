import { Box3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
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
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { MediaElementComponent } from '../../components/MediaElementComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VolumetricComponent, VolumetricComponentType } from '../../components/VolumetricComponent'
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

export const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
export const SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES = {
  useLoadingEffect: true
}

export const deserializeVolumetric: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<VolumetricComponentType>
) => {
  if (!isClient) return
  try {
    removeError(entity, 'error')
    addVolumetricComponent(entity, json.props)
  } catch (error) {
    console.error(error)
    addError(entity, 'error', error.message)
  }
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VOLUMETRIC)
}

export const addVolumetricComponent = (entity: Entity, props: VolumetricComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as VolumetricObject3D
  const mediaComponent = getComponent(entity, MediaComponent)
  const audioComponent = getComponent(entity, AudioComponent)

  let height = 0
  let step = 0.001

  const properties = parseVolumetricProperties(props)

  const player = new DracosisPlayer({
    scene: obj3d,
    renderer: EngineRenderer.instance.renderer,
    // https://github.com/XRFoundation/Universal-Volumetric/issues/117
    paths: mediaComponent.paths.length ? mediaComponent.paths : ['fake-path'],
    isLoadingEffect: properties.useLoadingEffect,
    isVideoTexture: false,
    playMode: mediaComponent.playMode as any,
    onMeshBuffering: (_progress) => {},
    onHandleEvent: (type, data) => {
      if (getEngineState().userHasInteracted.value && type == 'videostatus' && data.status == 'initplay') {
        height = calculateHeight(obj3d)
        height = height * obj3d.scale.y + 1
        step = height / 150
        setupLoadingEffect(entity, obj3d)
        obj3d.userData.isEffect = true
        obj3d.userData.time = 0
      }
    }
  })

  addComponent(entity, VolumetricComponent, {
    player,
    ...properties
  })

  obj3d.update = () => {
    if (!getEngineState().userHasInteracted.value) return
    if (player.hasPlayed) {
      player?.handleRender(() => {})
    }
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
        player.updateStatus('ready')
        player.play()
      }
    }
  }

  addComponent(entity, CallbackComponent, {
    play: () => player.play(),
    pause: () => player.pause(),
    seek: () => player.playOneFrame()
  })

  const el = player.video

  el.addEventListener('playing', () => {
    mediaComponent.playing = true
  })
  el.addEventListener('pause', () => {
    mediaComponent.playing = false
  })

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
  if (!vol) return
  return {
    name: SCENE_COMPONENT_VOLUMETRIC,
    props: {
      useLoadingEffect: vol.useLoadingEffect
    }
  }
}

export const prepareVolumetricForGLTFExport: ComponentPrepareForGLTFExportFunction = (video) => {
  if (video.userData.player) {
    video.userData.player.dispose()
    delete video.userData.player
  }
}

export const toggleVolumetric = (entity: Entity): boolean => {
  if (!getEngineState().userHasInteracted.value) return false
  const obj3d = getComponent(entity, Object3DComponent)?.value as VolumetricObject3D
  const { player } = getComponent(entity, VolumetricComponent)
  if (!obj3d) return false

  if (player.hasPlayed && !player.paused) {
    player.pause()
    return false
  } else {
    if (player.paused) {
      player.paused = false
    } else {
      player.play()
    }
    return true
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
