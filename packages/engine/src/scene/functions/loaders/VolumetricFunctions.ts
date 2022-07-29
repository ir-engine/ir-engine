import { Box3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AvatarDissolveComponent } from '@xrengine/engine/src/avatar/components/AvatarDissolveComponent'
import { AvatarEffectComponent, MaterialMap } from '@xrengine/engine/src/avatar/components/AvatarEffectComponent'
import { DissolveEffect } from '@xrengine/engine/src/avatar/DissolveEffect'
import { loadGrowingEffectObject } from '@xrengine/engine/src/avatar/functions/avatarFunctions'

import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { getEngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { MediaComponent } from '../../components/MediaComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VolumetricComponent } from '../../components/VolumetricComponent'
import { PlayMode } from '../../constants/PlayMode'
import { addError, removeError } from '../ErrorFunctions'

type VolumetricObject3D = UpdateableObject3D & {
  userData: {
    player: typeof import('@xrfoundation/volumetric/player').default.prototype
    isEffect: boolean
    time: number
  }
  play()
  pause()
  seek()
  callbacks()
}

let DracosisPlayer = null! as typeof import('@xrfoundation/volumetric/player').default

if (isClient) {
  Promise.all([import('@xrfoundation/volumetric/player')]).then(([module1]) => {
    DracosisPlayer = module1.default
  })
}

export const VolumetricCallbacks = [
  { label: 'None', value: 'none' },
  { label: 'Play', value: 'play' },
  { label: 'Pause', value: 'pause' },
  { label: 'Seek', value: 'seek' }
]

export const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
export const SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES = {
  paths: [],
  playMode: PlayMode.Single
}

export const deserializeVolumetric: ComponentDeserializeFunction = (entity: Entity, json: ComponentJson<{}>) => {
  if (!isClient) return
  try {
    removeError(entity, 'error')
    addVolumetricComponent(entity)
  } catch (error) {
    console.error(error)
    addError(entity, 'error', error.message)
  }
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VOLUMETRIC)
}

export const addVolumetricComponent = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value as VolumetricObject3D
  const mediaComponent = getComponent(entity, MediaComponent)

  let height = 0
  let step = 0.001

  const player = new DracosisPlayer({
    scene: obj3d,
    renderer: EngineRenderer.instance.renderer,
    paths: mediaComponent.paths,
    isLoadingEffect: isClient,
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

  addComponent(entity, VolumetricComponent, player)

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

  //setup callbacks
  obj3d.play = () => {
    if (getEngineState().userHasInteracted.value) {
      player.play()
    }
  }

  obj3d.pause = () => {
    if (getEngineState().userHasInteracted.value) player.pause()
  }

  obj3d.seek = () => {
    if (getEngineState().userHasInteracted.value) {
      player.playOneFrame()
    }
  }

  obj3d.callbacks = () => {
    return VolumetricCallbacks
  }
}

export const updateVolumetric: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value as VolumetricObject3D
  const player = getComponent(entity, VolumetricComponent)
  const mediaComponent = getComponent(entity, MediaComponent)

  const paths = mediaComponent.paths.filter((p) => p)

  if (paths.length && JSON.stringify(player.paths) !== JSON.stringify(paths)) {
    player.paths = paths
  }
}

export const serializeVolumetric: ComponentSerializeFunction = (entity) => {
  if (!hasComponent(entity, VolumetricComponent)) return
  return {
    name: SCENE_COMPONENT_VOLUMETRIC,
    props: {}
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
  const videoComponent = getComponent(entity, VolumetricComponent)
  if (!obj3d) return false

  if (videoComponent.hasPlayed && !videoComponent.paused) {
    videoComponent.pause()
    return false
  } else {
    if (videoComponent.paused) {
      videoComponent.paused = false
    } else {
      videoComponent.play()
    }
    return true
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
