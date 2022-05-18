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
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import UpdateableObject3D from '../../classes/UpdateableObject3D'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VolumetricComponent, VolumetricVideoComponentType } from '../../components/VolumetricComponent'
import { VolumetricPlayMode } from '../../constants/VolumetricPlayMode'
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
  playMode: VolumetricPlayMode.Single
}

export const deserializeVolumetric: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<VolumetricVideoComponentType>
) => {
  if (!isClient) return

  const props = parseVolumetricProperties(json.props)
  addComponent(entity, VolumetricComponent, props)

  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VOLUMETRIC)

  updateVolumetric(entity, props)
}

export const updateVolumetric: ComponentUpdateFunction = (entity: Entity, properties: VolumetricVideoComponentType) => {
  const obj3d = getComponent(entity, Object3DComponent).value as VolumetricObject3D
  const component = getComponent(entity, VolumetricComponent)
  const paths = component.paths.filter((p) => p)
  let height = 0
  let step = 0.001

  if (typeof properties.paths !== 'undefined' && paths.length) {
    try {
      if (obj3d.userData.player) {
        obj3d.userData.player.mesh.removeFromParent()
        obj3d.userData.player.dispose()
      }

      obj3d.userData.player = new DracosisPlayer({
        scene: obj3d,
        renderer: EngineRenderer.instance.renderer,
        paths,
        isLoadingEffect: isClient,
        isVideoTexture: false,
        playMode: component.playMode as any,
        onMeshBuffering: (_progress) => {},
        onHandleEvent: (type, data) => {
          if (type == 'videostatus' && data.status == 'initplay') {
            height = calculateHeight(obj3d)
            height = height * obj3d.scale.y + 1
            step = height / 150
            setupLoadingEffect(entity, obj3d)
            obj3d.userData.isEffect = true
            obj3d.userData.time = 0
          }
        }
      })

      removeError(entity, 'error')

      obj3d.update = () => {
        if (obj3d.userData.player.hasPlayed) {
          obj3d.userData.player?.handleRender(() => {})
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
            obj3d.userData.player.updateStatus('ready')
            obj3d.userData.player.play()
          }
        }
      }

      //setup callbacks
      obj3d.play = () => {
        obj3d.userData.player.play()
      }

      obj3d.pause = () => {
        obj3d.userData.player.pause()
      }

      obj3d.seek = () => {
        obj3d.userData.player.playOneFrame()
      }

      obj3d.callbacks = () => {
        return VolumetricCallbacks
      }
      //TODO: it is breaking the video play. need to check later
      // const audioSource = Engine.instance.currentWorld.audioListener.context.createMediaElementSource(obj3d.userData.player.video)
      // obj3d.userData.audioEl.setNodeSource(audioSource)
    } catch (error) {
      addError(entity, 'error', error.message)
    }
  }

  if (typeof properties.playMode !== 'undefined' && obj3d.userData.player) {
    obj3d.userData.player.playMode = component.playMode as any
  }
}

export const serializeVolumetric: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, VolumetricComponent) as VolumetricVideoComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_VOLUMETRIC,
    props: {
      paths: component.paths,
      playMode: component.playMode
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
  const obj3d = getComponent(entity, Object3DComponent)?.value as VolumetricObject3D
  if (!obj3d) return false

  if (obj3d.userData.player.hasPlayed && !obj3d.userData.player.paused) {
    obj3d.userData.player.pause()
    return false
  } else {
    if (obj3d.userData.player.paused) {
      obj3d.userData.player.paused = false
    } else {
      obj3d.userData.player.play()
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

const parseVolumetricProperties = (props): VolumetricVideoComponentType => {
  return {
    paths: props.paths ?? SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES.paths,
    playMode: props.playMode ?? SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES.playMode
  }
}
