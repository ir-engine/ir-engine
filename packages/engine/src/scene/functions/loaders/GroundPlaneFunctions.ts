import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { CircleGeometry, Color, Group, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three'

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
  hasComponent,
  removeComponent
} from '../../../ecs/functions/ComponentFunctions'
import { NavMeshComponent } from '../../../navigation/component/NavMeshComponent'
import { Physics } from '../../../physics/classes/Physics'
import { CollisionGroups } from '../../../physics/enums/CollisionGroups'
import { ColliderDescOptions } from '../../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import {
  GroundPlaneComponent,
  GroundPlaneComponentType,
  SCENE_COMPONENT_GROUND_PLANE_DEFAULT_VALUES
} from '../../components/GroundPlaneComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import { generateMeshBVH } from '../bvhWorkerPool'
import { enableObjectLayer } from '../setObjectLayers'

export const deserializeGround: ComponentDeserializeFunction = async function (
  entity: Entity,
  data: GroundPlaneComponentType
): Promise<void> {
  const props = parseGroundPlaneProperties(data)
  addComponent(entity, GroundPlaneComponent, props)
}

let navigationRaycastTarget: Group

export const updateGroundPlane: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, GroundPlaneComponent)

  /**
   * Create mesh & collider if it doesnt exist
   */
  if (!hasComponent(entity, Object3DComponent)) {
    const planeSize = new Vector3(1000, 0.1, 1000)
    const mesh = new Mesh(new CircleGeometry(planeSize.x, 32), new MeshStandardMaterial({ roughness: 1, metalness: 0 }))

    mesh.name = 'GroundPlaneMesh'
    mesh.position.y = -0.05

    const colliderDescOptions = {
      bodyType: RigidBodyType.Fixed,
      type: ShapeType.Cuboid,
      size: planeSize,
      removeMesh: false,
      collisionLayer: CollisionGroups.Ground,
      collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
    } as ColliderDescOptions

    const groundPlane = new Object3D()
    groundPlane.userData.mesh = mesh
    groundPlane.add(mesh)

    addComponent(entity, Object3DComponent, { value: groundPlane })

    Physics.createRigidBodyForObject(
      entity,
      Engine.instance.currentWorld.physicsWorld,
      groundPlane.userData.mesh,
      colliderDescOptions
    )

    mesh.rotation.x = -Math.PI / 2

    groundPlane.traverse(generateMeshBVH)
    enableObjectLayer(groundPlane, ObjectLayers.Camera, true)
  }

  /**
   * Update settings
   */

  const groundPlane = getComponent(entity, Object3DComponent).value

  ;(groundPlane.userData.mesh.material as MeshStandardMaterial).color.set(component.color)

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
