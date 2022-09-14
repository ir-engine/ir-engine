import { entityExists } from 'bitecs'
import { Camera, Mesh, Quaternion, Vector3 } from 'three'

import logger from '@xrengine/common/src/logger'
import { insertionSort } from '@xrengine/common/src/utils/insertionSort'
import { createActionQueue, getState } from '@xrengine/hyperflux'

import { updateReferenceSpace } from '../../avatar/functions/moveAvatar'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent, BoundingBoxDynamicTag } from '../../interaction/components/BoundingBoxComponents'
import { NetworkObjectOwnedTag } from '../../networking/components/NetworkObjectOwnedTag'
import { RigidBodyComponent, RigidBodyDynamicTagComponent } from '../../physics/components/RigidBodyComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { GroupColliderComponent } from '../../scene/components/ColliderComponent'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'
import { updateCollider, updateGroupCollider } from '../../scene/functions/loaders/ColliderFunctions'
import { deserializeTransform, serializeTransform } from '../../scene/functions/loaders/TransformFunctions'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import { DistanceFromCameraComponent, DistanceFromLocalClientComponent } from '../components/DistanceComponents'
import { LocalTransformComponent } from '../components/LocalTransformComponent'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../components/TransformComponent'

const scratchVector3 = new Vector3()
const scratchQuaternion = new Quaternion()

const ownedDynamicRigidBodyQuery = defineQuery([
  RigidBodyComponent,
  RigidBodyDynamicTagComponent,
  NetworkObjectOwnedTag,
  TransformComponent,
  VelocityComponent
])

const groupQuery = defineQuery([GroupComponent])
const localTransformQuery = defineQuery([LocalTransformComponent])
const transformQuery = defineQuery([TransformComponent])
const spawnPointQuery = defineQuery([SpawnPointComponent])

const staticBoundingBoxQuery = defineQuery([Object3DComponent, BoundingBoxComponent])
const dynamicBoundingBoxQuery = defineQuery([Object3DComponent, BoundingBoxComponent, BoundingBoxDynamicTag])

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])
const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])

const prevRigidbodyScale = new Map<Entity, Vector3>()

const updateTransformFromLocalTransform = (entity: Entity) => {
  const world = Engine.instance.currentWorld
  const localTransform = getComponent(entity, LocalTransformComponent)
  const parentTransform = localTransform?.parentEntity
    ? getComponent(localTransform.parentEntity, TransformComponent)
    : undefined
  if (
    localTransform &&
    parentTransform &&
    (world.dirtyTransforms.has(entity) || world.dirtyTransforms.has(localTransform.parentEntity))
  ) {
    const transform = getComponent(entity, TransformComponent)
    localTransform.matrix.compose(localTransform.position, localTransform.rotation, localTransform.scale)
    transform.matrix.multiplyMatrices(parentTransform.matrix, localTransform.matrix)
    transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
  }
}

const updateTransformFromRigidbody = (entity: Entity) => {
  if (!hasComponent(entity, RigidBodyComponent)) return

  const world = Engine.instance.currentWorld
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  const velocity = getComponent(entity, VelocityComponent)
  const localTransform = getComponent(entity, LocalTransformComponent)

  // if transforms have been changed outside of the transform system, perform physics teleportation on the rigidbody
  if (world.dirtyTransforms.has(entity) || (localTransform && world.dirtyTransforms.has(localTransform.parentEntity))) {
    const prevScale = prevRigidbodyScale.get(entity)
    prevRigidbodyScale.set(entity, transform.scale.clone())

    rigidBody.body.setTranslation(transform.position, !rigidBody.body.isSleeping())
    rigidBody.body.setRotation(transform.rotation, !rigidBody.body.isSleeping())

    // if scale has changed, we have to recreate the collider
    const scaleChanged = prevScale ? prevScale.manhattanDistanceTo(transform.scale) > 0.0001 : true

    if (scaleChanged) {
      if (hasComponent(entity, GroupColliderComponent)) updateGroupCollider(entity)
      else updateCollider(entity)
    }

    return
  }

  /*
  Interpolate the remaining time after the fixed pipeline is complete.
  See https://gafferongames.com/post/fix_your_timestep/#the-final-touch
  */
  const accumulator = world.elapsedSeconds - world.fixedElapsedSeconds
  const alpha = accumulator / getState(EngineState).fixedDeltaSeconds.value

  const bodyPosition = rigidBody.body.translation() as Vector3
  const bodyRotation = rigidBody.body.rotation() as Quaternion

  transform.position.copy(rigidBody.previousPosition).lerp(scratchVector3.copy(bodyPosition), alpha)
  transform.rotation.copy(rigidBody.previousRotation).slerp(scratchQuaternion.copy(bodyRotation), alpha)
  transform.matrix.compose(transform.position, transform.rotation, transform.scale)

  velocity.linear
    .copy(rigidBody.previousLinearVelocity)
    .lerp(scratchVector3.copy(rigidBody.body.linvel() as Vector3), alpha)
  velocity.angular
    .copy(rigidBody.previousAngularVelocity)
    .lerp(scratchVector3.copy(rigidBody.body.angvel() as Vector3), alpha)

  if (localTransform) {
    const parentTransform = getComponent(localTransform.parentEntity, TransformComponent) || transform
    localTransform.matrix.multiplyMatrices(parentTransform.matrixInverse, transform.matrix)
    localTransform.matrix.decompose(localTransform.position, localTransform.rotation, localTransform.scale)
    updateTransformFromLocalTransform(entity)
  }
}

const getDistanceSquaredFromTarget = (entity: Entity, targetPosition: Vector3) => {
  return getComponent(entity, TransformComponent).position.distanceToSquared(targetPosition)
}

export default async function TransformSystem(world: World) {
  world.sceneComponentRegistry.set(TransformComponent.name, SCENE_COMPONENT_TRANSFORM)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_TRANSFORM, {
    defaultData: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
    deserialize: deserializeTransform,
    serialize: serializeTransform
  })

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

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
    const group = getComponent(entity, GroupComponent)

    box.makeEmpty()

    for (const obj of group) {
      obj.traverse((child) => {
        const mesh = child as Mesh
        if (mesh.isMesh) {
          mesh.geometry.computeBoundingBox()
        }
      })

      box.expandByObject(obj)
    }
  }

  const updateBoundingBox = (entity: Entity) => {
    const box = getComponent(entity, BoundingBoxComponent).box
    const group = getComponent(entity, GroupComponent)
    box.makeEmpty()
    for (const obj of group) box.expandByObject(obj)
  }

  return () => {
    // update transform components from rigid body components,
    // interpolating the remaining time after the fixed pipeline is complete.
    // we only update the transform for objects that we have authority over.

    // for (const entity of ownedDynamicRigidBodyQuery.enter()) {
    //   setComputedTransformComponent(entity, Engine.instance.currentWorld.sceneEntity, updateRigidbodyTransforms)
    // }

    // if transform order is dirty, sort by reference depth
    const { transformsNeedSorting } = getState(EngineState)
    const transformEntities = transformQuery()

    if (transformsNeedSorting.value) {
      for (const entity of transformEntities) updateComputedReferenceDepth(entity)
      insertionSort(transformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
      transformsNeedSorting.set(false)
    }

    // IMPORTANT: update transforms in order of reference depth
    // Note: cyclic references will cause undefined behavior

    for (const entity of transformEntities) {
      const transform = getComponent(entity, TransformComponent)
      if (!transform) continue

      const computedTransform = getComponent(entity, ComputedTransformComponent)
      const group = getComponent(entity, GroupComponent) as any as (Mesh & Camera)[]

      updateTransformFromLocalTransform(entity)
      updateTransformFromRigidbody(entity)

      if (computedTransform && hasComponent(computedTransform.referenceEntity, TransformComponent)) {
        computedTransform?.computeFunction(entity, computedTransform.referenceEntity)
      }

      if (world.dirtyTransforms.has(entity)) {
        // avoid scale 0 to prevent NaN errors
        transform.scale.x = Math.max(1e-10, transform.scale.x)
        transform.scale.y = Math.max(1e-10, transform.scale.y)
        transform.scale.z = Math.max(1e-10, transform.scale.z)
        transform.matrix.compose(transform.position, transform.rotation, transform.scale)
        transform.matrixInverse.copy(transform.matrix).invert()
      }

      if (group) {
        // drop down one level and update children
        for (const root of group) {
          for (const obj of root.children) {
            obj.updateMatrixWorld()
          }
        }
      }
    }

    world.dirtyTransforms.clear()

    for (const entity of staticBoundingBoxQuery.enter()) computeBoundingBox(entity)
    for (const entity of dynamicBoundingBoxQuery()) updateBoundingBox(entity)

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (
          hasComponent(entity, BoundingBoxComponent) &&
          hasComponent(entity, TransformComponent) &&
          hasComponent(entity, Object3DComponent)
        )
          updateBoundingBox(entity)
      }
    }

    const cameraPosition = getComponent(world.cameraEntity, TransformComponent).position
    for (const entity of distanceFromCameraQuery())
      DistanceFromCameraComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(entity, cameraPosition)

    if (entityExists(world, world.localClientEntity)) {
      const localClientPosition = getComponent(world.localClientEntity, TransformComponent)?.position
      if (localClientPosition) {
        for (const entity of distanceFromLocalClientQuery())
          DistanceFromLocalClientComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(
            entity,
            localClientPosition
          )
      }

      updateReferenceSpace(world.localClientEntity)
    }
  }
}
