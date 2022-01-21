import {
  BoxBufferGeometry,
  BoxHelper,
  EquirectangularRefractionMapping,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Scene,
  SphereGeometry,
  Vector3
} from 'three'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  hasComponent
} from '../../../ecs/functions/ComponentFunctions'
import { CubemapBakeComponent, CubemapBakeComponentType } from '../../components/CubemapBakeComponent'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Engine } from '../../../ecs/classes/Engine'
import { Object3DComponent } from '../../components/Object3DComponent'
import { CubemapBakeTypes } from '../../types/CubemapBakeTypes'
import { CubemapBakeRefreshTypes } from '../../types/CubemapBakeRefreshTypes'
import { useWorld } from '../../../ecs/functions/SystemHooks'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'
import { textureLoader } from '../../constants/Util'
import { CubemapBakeSettings } from '../../types/CubemapBakeSettings'

const quat = new Quaternion(0)
export const SCENE_COMPONENT_CUBEMAP_BAKE = 'cubemapbake'
export const SCENE_COMPONENT_CUBEMAP_BAKE_DEFAULT_VALUES = {
  options: {
    bakePosition: new Vector3(),
    bakePositionOffset: new Vector3(),
    bakeScale: new Vector3(1, 1, 1),
    bakeType: CubemapBakeTypes.Baked,
    resolution: 512,
    refreshMode: CubemapBakeRefreshTypes.OnAwake,
    envMapOrigin: '',
    boxProjection: true
  }
}

export const deserializeCubemapBake: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<CubemapBakeComponentType>
) => {
  const obj3d = new Object3D()
  addComponent(entity, Object3DComponent, { value: obj3d })

  if (!Engine.isEditor) return

  json.props.options.bakePosition = new Vector3().copy(json.props.options.bakePosition)

  if (json.props.options.bakeScale) {
    json.props.options.bakeScale = new Vector3().copy(json.props.options.bakeScale)
  }

  if (json.props.options.bakePositionOffset) {
    json.props.options.bakePositionOffset = new Vector3().copy(json.props.options.bakePositionOffset)
  }

  const bakeComponent = addComponent(entity, CubemapBakeComponent, { ...json.props })
  addComponent(entity, PreventBakeTagComponent, {})
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_CUBEMAP_BAKE)

  obj3d.userData.centerBall = new Mesh(
    new SphereGeometry(0.75),
    new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })
  )
  obj3d.userData.centerBall.userData.disableOutline = true
  obj3d.add(obj3d.userData.centerBall)

  obj3d.userData.gizmo = new BoxHelper(new Mesh(new BoxBufferGeometry()), 0xff0000)
  obj3d.userData.gizmo.userData.disableOutline = true
  obj3d.add(obj3d.userData.gizmo)

  updateCubemapBake(entity)
  updateCubemapBakeTexture(bakeComponent.options)
}

export const updateCubemapBake: ComponentUpdateFunction = (entity: Entity) => {
  const obj3d = getComponent(entity, Object3DComponent).value
  const bakeComponent = getComponent(entity, CubemapBakeComponent)
  obj3d.userData.gizmo.matrix.compose(bakeComponent.options.bakePositionOffset, quat, bakeComponent.options.bakeScale)
}

export const updateCubemapBakeTexture = (options: CubemapBakeSettings) => {
  textureLoader.load(options.envMapOrigin, (texture) => {
    Engine.scene.environment = texture
    texture.mapping = EquirectangularRefractionMapping
  })
}

export const serializeCubemapBake: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, CubemapBakeComponent) as CubemapBakeComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_CUBEMAP_BAKE,
    props: {
      options: component.options
    }
  }
}

export const shouldDeserializeCubemapBake: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(CubemapBakeComponent) <= 0
}

export const prepareSceneForBake = (world = useWorld()): Scene => {
  const scene = Engine.scene.clone(false)
  const parents = {
    [world.entityTree.rootNode.entity]: scene
  } as { [key: Entity]: Object3D }

  world.entityTree.traverse((node) => {
    if (node === world.entityTree.rootNode || hasComponent(node.entity, PreventBakeTagComponent)) return

    const obj3d = getComponent(node.entity, Object3DComponent)?.value as Mesh<any, MeshStandardMaterial>

    if (obj3d) {
      if (obj3d.material) obj3d.material.roughness = 1
      parents[node.parentNode.entity].add(obj3d)
      parents[node.entity] = obj3d
    }
  })

  return scene
}
