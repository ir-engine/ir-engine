import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { VolumetricComponent, VolumetricVideoComponentType } from '../../components/VolumetricComponent'
import { isClient } from '../../../common/functions/isClient'

import { VolumetricPlayMode } from '../../constants/VolumetricPlayMode'
import UpdateableObject3D from '../../classes/UpdateableObject3D'

let DracosisPlayer = null as any

if (isClient) {
  Promise.all([import('volumetric/player')]).then(([module1]) => {
    DracosisPlayer = module1.default
  })
}

const VolumetricsExtensions = ['drcs', 'uvol']
export const SCENE_COMPONENT_VOLUMETRIC = 'volumetric'
export const SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES = {
  paths: [],
  playMode: VolumetricPlayMode.Single
}

export const deserializeVolumetric: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<VolumetricVideoComponentType>
) => {
  const obj3d = new UpdateableObject3D()
  obj3d.name = 'Volumetric'
  addComponent(entity, Object3DComponent, { value: obj3d })

  if (!isClient) return

  addComponent(entity, VolumetricComponent, { ...json.props })

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VOLUMETRIC)

  updateVolumetric(entity, json.props)
}

export const updateVolumetric: ComponentUpdateFunction = async (
  entity: Entity,
  properties: VolumetricVideoComponentType
) => {
  const obj3d = getComponent(entity, Object3DComponent).value as UpdateableObject3D
  const component = getComponent(entity, VolumetricComponent)

  if (properties.hasOwnProperty('paths')) {
    try {
      if (component.paths.length <= 0) return

      const validPaths = [] as string[]
      for (let i = 0; i < component.paths.length; i++) {
        const path = new URL(component.paths[i], window.location.origin).href
        if (path && VolumetricsExtensions.includes(getFileExtension(path))) {
          validPaths.push(path)
        }
      }

      if (validPaths.length <= 0) return

      if (obj3d.userData.player) {
        obj3d.userData.player.mesh.removeFromParent()
        obj3d.userData.player.dispose()
      }

      obj3d.update = () => {
        if (obj3d.userData.player.hasPlayed) {
          obj3d.userData.player?.handleRender(() => {})
        }
      }

      obj3d.userData.player = new DracosisPlayer({
        scene: obj3d,
        renderer: Engine.renderer,
        paths: validPaths,
        playMode: component.playMode as any,
        autoplay: true,
        onMeshBuffering: (_progress) => {},
        onFrameShow: () => {}
      })

      const audioSource = Engine.audioListener.context.createMediaElementSource(obj3d.userData.player.video)
      obj3d.userData.audioEl.setNodeSource(audioSource)
    } catch (error) {
      console.error(error)
    }
  }

  if (properties.hasOwnProperty('playMode')) obj3d.userData.player.playMode = component.playMode as any
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

const getFileExtension = (url): string => {
  try {
    return new URL(url).pathname.split('.').pop()!
  } catch (error) {
    return ''
  }
}

export const toggleVolumetric = (entity: Entity): boolean => {
  const obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) return false

  if (obj3d.userData.player.hasPlayed) {
    obj3d.userData.player.stopOnNextFrame = true
    return false
  } else {
    obj3d.userData.player.stopOnNextFrame = false
    obj3d.userData.player.play()
    return true
  }
}
