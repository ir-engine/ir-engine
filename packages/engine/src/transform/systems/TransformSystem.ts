import { Box3, Mesh, Quaternion, Vector3 } from 'three'

import logger from '@xrengine/common/src/logger'
import { insertionSort } from '@xrengine/common/src/utils/insertionSort'
import { getState } from '@xrengine/hyperflux'

import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/three'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent, BoundingBoxDynamicTag } from '../../interaction/components/BoundingBoxComponents'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { RigidBodyDynamicTagComponent } from '../../physics/components/RigidBodyDynamicTagComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'
import {
  applyTransformPositionOffset,
  applyTransformRotationOffset
} from '../../scene/functions/loaders/TransformFunctions'
import { ComputedTransformComponent, setComputedTransformComponent } from '../components/ComputedTransformComponent'
import { DistanceFromCameraComponent, DistanceFromLocalClientComponent } from '../components/DistanceComponents'
import { LocalTransformComponent } from '../components/LocalTransformComponent'
import { TransformComponent } from '../components/TransformComponent'

const scratchVector3 = new Vector3()
const scratchQuaternion = new Quaternion()

const ownedDynamicRigidBodyQuery = defineQuery([
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  NetworkObjectOwnedTag,
  TransformComponent,
  VelocityComponent
])
const transformObjectQuery = defineQuery([TransformComponent, Object3DComponent])
const localTransformQuery = defineQuery([LocalTransformComponent])
const transformQuery = defineQuery([TransformComponent])
const spawnPointQuery = defineQuery([SpawnPointComponent])

const staticBoundingBoxQuery = defineQuery([Object3DComponent, BoundingBoxComponent])
const dynamicBoundingBoxQuery = defineQuery([Object3DComponent, BoundingBoxComponent, BoundingBoxDynamicTag])

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])
const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])

const updateTransformFromBody = (world: World, entity: Entity) => {
  const { body, previousPosition, previousRotation, previousLinearVelocity, previousAngularVelocity } = getComponent(
    entity,
    RigidBodyComponent
  )
  const { position, rotation } = getComponent(entity, TransformComponent)
  const { linear, angular } = getComponent(entity, VelocityComponent)
  /*
  Interpolate the remaining time after the fixed pipeline is complete.
  See https://gafferongames.com/post/fix_your_timestep/#the-final-touch
  */
  const accumulator = world.elapsedSeconds - world.fixedElapsedSeconds
  const alpha = accumulator / getState(EngineState).deltaSeconds.value
  position.copy(previousPosition).lerp(scratchVector3.copy(body.translation() as Vector3), alpha)
  rotation.copy(previousRotation).slerp(scratchQuaternion.copy(body.rotation() as Quaternion), alpha)
  linear.copy(previousLinearVelocity).lerp(scratchVector3.copy(body.linvel() as Vector3), alpha)
  angular.copy(previousAngularVelocity).lerp(scratchVector3.copy(body.angvel() as Vector3), alpha)
}

const getDistanceSquaredFromTarget = (entity: Entity, targetPosition: Vector3) => {
  return getComponent(entity, TransformComponent).position.distanceToSquared(targetPosition)
}

export default async function TransformSystem(world: World) {
  const computedReferenceDepths = new Map<Entity, number>()

  const visitedReferenceEntities = new Set<Entity>()

  const updateComputedReferenceDepth = (entity: Entity) => {
    const computedTransform = getComponent(entity, ComputedTransformComponent)

    visitedReferenceEntities.clear()
    let depth = 0
    if (computedTransform) {
      let reference = computedTransform.referenceEntity
      while (reference) {
        visitedReferenceEntities.add(reference)
        depth++
        const referenceComputedTransform = getComponent(reference, ComputedTransformComponent)
        reference = referenceComputedTransform?.referenceEntity
        if (visitedReferenceEntities.has(reference)) {
          logger.warn(`Cyclic reference detected in computed transform for entity ${entity}`)
          break
        }
      }
    }

    computedReferenceDepths.set(entity, depth)
  }

  const compareReferenceDepth = (a: Entity, b: Entity) => {
    const aDepth = computedReferenceDepths.get(a)!
    const bDepth = computedReferenceDepths.get(b)!
    return aDepth - bDepth
  }

  const computeBoundingBox = (entity: Entity) => {
    const box = getComponent(entity, BoundingBoxComponent).box
    const obj = getComponent(entity, Object3DComponent).value
    obj.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.geometry.computeBoundingBox()
      }
    })
    box.setFromObject(obj)
  }

  const updateBoundingBox = (entity: Entity) => {
    const box = getComponent(entity, BoundingBoxComponent).box
    const obj = getComponent(entity, Object3DComponent).value
    box.setFromObject(obj)
  }

  return () => {
    for (const entity of localTransformQuery.enter()) {
      const parentEntity = world.entityTree.entityNodeMap.get(entity)?.parentEntity!
      setComputedTransformComponent(entity, parentEntity, (childEntity, parentEntity) => {
        const transform = getComponent(childEntity, TransformComponent)
        const localTransform = getComponent(childEntity, LocalTransformComponent)
        const parentTransform = getComponent(parentEntity, TransformComponent)
        applyTransformPositionOffset(transform, parentTransform, localTransform.position)
        applyTransformRotationOffset(transform, parentTransform, localTransform.rotation)
      })
    }

    // proxify all object3D components w/ a transform component

    for (const entity of transformObjectQuery.enter()) {
      const transform = getComponent(entity, TransformComponent)
      const object3D = getComponent(entity, Object3DComponent).value
      if (transform && object3D) {
        object3D.matrixAutoUpdate = false
        object3D.position.copy(transform.position)
        object3D.quaternion.copy(transform.rotation)
        object3D.scale.copy(transform.scale)
        proxifyVector3(TransformComponent.position, entity, world.dirtyTransforms, object3D.position)
        proxifyQuaternion(TransformComponent.rotation, entity, world.dirtyTransforms, object3D.quaternion)
        proxifyVector3(TransformComponent.scale, entity, world.dirtyTransforms, object3D.scale)
      }
    }

    // update transform components from rigid body components,
    // interpolating the remaining time after the fixed pipeline is complete.
    // we only update the transform for objects that we have authority over.

    for (const entity of ownedDynamicRigidBodyQuery()) updateTransformFromBody(world, entity)

    // if transform order is dirty, sort by reference depth

    const { transformsNeedSorting } = getState(EngineState)
    const transformEntities = transformQuery()

    if (transformsNeedSorting.value) {
      for (const entity of transformEntities) updateComputedReferenceDepth(entity)
      insertionSort(transformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
      transformsNeedSorting.set(false)
    }

    // update transforms in order of reference depth
    // Note: cyclic references will cause undefined behavior

    for (const entity of transformEntities) {
      const transform = getComponent(entity, TransformComponent)
      const computedTransform = getComponent(entity, ComputedTransformComponent)
      const object3D = getComponent(entity, Object3DComponent)?.value

      if (computedTransform && hasComponent(computedTransform.referenceEntity, TransformComponent)) {
        computedTransform?.computeFunction(entity, computedTransform.referenceEntity)
      }

      if (object3D) {
        if (world.dirtyTransforms.has(entity)) {
          // replace scale 0 with epsilon to prevent NaN errors
          if (transform.scale.x === 0) transform.scale.x = 1e-10
          if (transform.scale.y === 0) transform.scale.y = 1e-10
          if (transform.scale.z === 0) transform.scale.z = 1e-10
          object3D.updateMatrix()
          world.dirtyTransforms.delete(entity)
        }

        object3D.updateMatrixWorld(true)

        if (Engine.instance.isEditor) {
          /** @todo refactor helpers */
          for (let entity of spawnPointQuery()) {
            const obj3d = getComponent(entity, Object3DComponent)?.value
            if (obj3d) obj3d.userData.helperModel?.scale.set(1 / obj3d.scale.x, 1 / obj3d.scale.y, 1 / obj3d.scale.z)
          }
        }
      }
    }

    for (const entity of staticBoundingBoxQuery.enter()) computeBoundingBox(entity)
    for (const entity of dynamicBoundingBoxQuery()) updateBoundingBox(entity)

    const localClientPosition = getComponent(world.localClientEntity, TransformComponent)?.position
    if (localClientPosition) {
      for (const entity of distanceFromLocalClientQuery())
        DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
          entity,
          localClientPosition
        )
    }

    const cameraPosition = getComponent(world.cameraEntity, TransformComponent).position
    for (const entity of distanceFromCameraQuery())
      DistanceFromCameraComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(entity, cameraPosition)
  }
}
