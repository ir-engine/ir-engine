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
import { addError, removeError } from '../ErrorFunctions'

type VolumetricObject3D = UpdateableObject3D & {
  userData: {
    player: typeof import('volumetric/player').default.prototype
  }
}

let DracosisPlayer = null! as typeof import('volumetric/player').default

if (isClient) {
  Promise.all([import('volumetric/player')]).then(([module1]) => {
    DracosisPlayer = module1.default
  })
}

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

  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_VOLUMETRIC)

  updateVolumetric(entity, props)
}

export const updateVolumetric: ComponentUpdateFunction = async (
  entity: Entity,
  properties: VolumetricVideoComponentType
) => {
  const obj3d = getComponent(entity, Object3DComponent).value as VolumetricObject3D
  const component = getComponent(entity, VolumetricComponent)
  const paths = component.paths.filter((p) => p)

  if (typeof properties.paths !== 'undefined' && paths.length) {
    try {
      if (obj3d.userData.player) {
        obj3d.userData.player.mesh.removeFromParent()
        obj3d.userData.player.dispose()
      }

      obj3d.userData.player = new DracosisPlayer({
        scene: obj3d,
        renderer: Engine.renderer,
        paths,
        playMode: component.playMode as any,
        autoplay: true,
        onMeshBuffering: (_progress) => {},
        onFrameShow: () => {}
      })

      removeError(entity, 'error')

      obj3d.update = () => {
        if (obj3d.userData.player.hasPlayed) {
          obj3d.userData.player?.handleRender(() => {})
        }
      }

      const audioSource = Engine.audioListener.context.createMediaElementSource(obj3d.userData.player.video)
      obj3d.userData.audioEl.setNodeSource(audioSource)
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

  if (obj3d.userData.player.hasPlayed) {
    obj3d.userData.player.stopOnNextFrame = true
    return false
  } else {
    obj3d.userData.player.stopOnNextFrame = false
    obj3d.userData.player.play()
    return true
  }
}

const parseVolumetricProperties = (props): VolumetricVideoComponentType => {
  return {
    paths: props.paths ?? SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES.paths,
    playMode: props.playMode ?? SCENE_COMPONENT_VOLUMETRIC_DEFAULT_VALUES.playMode
  }
}
