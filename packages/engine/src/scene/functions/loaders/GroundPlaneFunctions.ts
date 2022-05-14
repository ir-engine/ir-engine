import { CircleBufferGeometry, Color, Group, Mesh, MeshStandardMaterial, Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import {
  ComponentDeserializeFunction,
  ComponentPrepareForGLTFExportFunction,
  ComponentSerializeFunction,
  ComponentShouldDeserializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getComponentCountOfType,
  removeComponent
} from '../../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../../navigation/component/NavMeshComponent'
import { CollisionGroups } from '../../../physics/enums/CollisionGroups'
import { createCollider } from '../../../physics/functions/createCollider'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { GroundPlaneComponent, GroundPlaneComponentType } from '../../components/GroundPlaneComponent'
import { Object3DComponent } from '../../components/Object3DComponent'

export const SCENE_COMPONENT_GROUND_PLANE = 'ground-plane'
export const SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES = {
  color: '#ffffff',
  generateNavmesh: false
}

export const deserializeGround: ComponentDeserializeFunction = async function (
  entity: Entity,
  json: ComponentJson<GroundPlaneComponentType>
): Promise<void> {
  const mesh = new Mesh(new CircleBufferGeometry(1000, 32), new MeshStandardMaterial({ roughness: 1, metalness: 0 }))

  mesh.name = 'GroundPlaneMesh'
  mesh.position.y = -0.05
  mesh.rotation.x = -Math.PI / 2
  mesh.userData = {
    type: 'ground',
    collisionLayer: CollisionGroups.Ground,
    collisionMask: CollisionGroups.Default
  }

  const groundPlane = new Object3D()
  groundPlane.userData.mesh = mesh
  groundPlane.add(mesh)

  addComponent(entity, Object3DComponent, { value: groundPlane })

  const props = parseGroundPlaneProperties(json.props)
  addComponent(entity, GroundPlaneComponent, props)
  getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_GROUND_PLANE)

  // @TODO: make this isomorphic with editor
  if (!Engine.instance.isEditor) createCollider(entity, groundPlane.userData.mesh)

  updateGroundPlane(entity, props)
}

let navigationRaycastTarget: Group

export const updateGroundPlane: ComponentUpdateFunction = (entity: Entity, properties: GroundPlaneComponentType) => {
  const component = getComponent(entity, GroundPlaneComponent)
  const groundPlane = getComponent(entity, Object3DComponent)?.value

  if (typeof properties.color !== 'undefined') {
    ;(groundPlane.userData.mesh.material as MeshStandardMaterial).color.set(component.color)
  }

  if (component.generateNavmesh === component.isNavmeshGenerated) return

  if (isClient && !Engine.instance.isEditor) {
    if (component.generateNavmesh) {
      if (!navigationRaycastTarget) navigationRaycastTarget = new Group()

      navigationRaycastTarget.scale.setScalar(getComponent(entity, TransformComponent).scale.x)
      Engine.instance.currentWorld.scene.add(navigationRaycastTarget)
      addComponent(entity, NavMeshComponent, { navTarget: navigationRaycastTarget })
    } else {
      Engine.instance.currentWorld.scene.remove(navigationRaycastTarget)
      removeComponent(entity, NavMeshComponent)
    }
  }

  component.isNavmeshGenerated === component.generateNavmesh
}

export const serializeGroundPlane: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, GroundPlaneComponent) as GroundPlaneComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_GROUND_PLANE,
    props: {
      color: component.color.getHex(),
      generateNavmesh: component.generateNavmesh
    }
  }
}

export const shouldDeserializeGroundPlane: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(GroundPlaneComponent) <= 0
}

export const prepareGroundPlaneForGLTFExport: ComponentPrepareForGLTFExportFunction = (groundPlane) => {
  if (!groundPlane.userData.mesh) return
  /*
  const collider = new Object3D()
  collider.scale.set(groundPlane.userData.mesh.scale.x, 0.1, groundPlane.userData.mesh.scale.z)

  groundPlane.add(collider)
  groundPlane.userData.mesh.removeFromParent()
  delete groundPlane.userData.mesh*/
}

const parseGroundPlaneProperties = (props): GroundPlaneComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES.color),
    generateNavmesh: props.generateNavmesh ?? SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES.generateNavmesh
  }
}
