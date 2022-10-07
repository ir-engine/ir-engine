import { ColliderDesc, RigidBodyDesc, RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import {
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
  Vector3
} from 'three'

import {
  ComponentDeserializeFunction,
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
  removeComponent,
  setComponent
} from '../../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../../navigation/component/NavMeshComponent'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { CollisionGroups } from '../../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../../physics/functions/getInteractionGroups'
import { ColliderDescOptions } from '../../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import {
  GroundPlaneComponent,
  GroundPlaneComponentType,
  SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES
} from '../../components/GroundPlaneComponent'
import { addObjectToGroup } from '../../components/GroupComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { generateMeshBVH } from '../bvhWorkerPool'
import { enableObjectLayer } from '../setObjectLayers'

export const deserializeGround: ComponentDeserializeFunction = async function (
  entity: Entity,
  data: GroundPlaneComponentType
): Promise<void> {
  const props = parseGroundPlaneProperties(data)
  setComponent(entity, GroundPlaneComponent, props)
}

let navigationRaycastTarget: Group

export const updateGroundPlane: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, GroundPlaneComponent)

  /**
   * Create mesh & collider if it doesnt exist
   */
  if (!component.mesh) {
    const radius = 1000

    const mesh = (component.mesh = new Mesh(new PlaneGeometry(radius, radius), new MeshLambertMaterial()))
    mesh.geometry.rotateX(-Math.PI / 2)
    mesh.name = 'GroundPlaneMesh'
    // mesh.position.y = -0.05
    mesh.traverse(generateMeshBVH)

    enableObjectLayer(mesh, ObjectLayers.Camera, true)
    addObjectToGroup(entity, mesh)

    const rigidBodyDesc = RigidBodyDesc.fixed()
    const colliderDesc = ColliderDesc.cuboid(radius * 2, 0.001, radius * 2)
    colliderDesc.setCollisionGroups(
      getInteractionGroups(CollisionGroups.Ground, CollisionGroups.Default | CollisionGroups.Avatars)
    )

    Physics.createRigidBody(entity, Engine.instance.currentWorld.physicsWorld, rigidBodyDesc, [colliderDesc])
  }

  /**
   * Update settings
   */

  const mesh = component.mesh!
  mesh.material.color.set(component.color)

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
  const component = getComponent(entity, GroundPlaneComponent)
  return {
    color: component.color.getHex(),
    generateNavmesh: component.generateNavmesh
  }
}

export const shouldDeserializeGroundPlane: ComponentShouldDeserializeFunction = () => {
  return getComponentCountOfType(GroundPlaneComponent) <= 0
}

const parseGroundPlaneProperties = (props): GroundPlaneComponentType => {
  return {
    color: new Color(props.color ?? SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES.color),
    generateNavmesh: props.generateNavmesh ?? SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES.generateNavmesh
  }
}
