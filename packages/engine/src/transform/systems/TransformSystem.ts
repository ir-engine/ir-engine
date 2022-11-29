import { entityExists } from 'bitecs'
import { Camera, Frustum, Matrix4, Mesh, Vector3 } from 'three'

import { insertionSort } from '@xrengine/common/src/utils/insertionSort'
import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { updateReferenceSpace } from '../../avatar/functions/moveAvatar'
import { V_000 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeQuery
} from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent, BoundingBoxDynamicTag } from '../../interaction/components/BoundingBoxComponents'
import { RigidBodyComponent, RigidBodyDynamicTagComponent } from '../../physics/components/RigidBodyComponent'
import { GLTFLoadedComponent } from '../../scene/components/GLTFLoadedComponent'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { updateCollider, updateModelColliders } from '../../scene/functions/loaders/ColliderFunctions'
import { deserializeTransform, serializeTransform } from '../../scene/functions/loaders/TransformFunctions'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import {
  DistanceFromCameraComponent,
  DistanceFromLocalClientComponent,
  FrustumCullCameraComponent
} from '../components/DistanceComponents'
import {
  LocalTransformComponent,
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../components/TransformComponent'

const transformQuery = defineQuery([TransformComponent])
const localTransformQuery = defineQuery([LocalTransformComponent])
const rigidbodyTransformQuery = defineQuery([TransformComponent, RigidBodyComponent])
const groupQuery = defineQuery([GroupComponent, TransformComponent])

const staticBoundingBoxQuery = defineQuery([GroupComponent, BoundingBoxComponent])
const dynamicBoundingBoxQuery = defineQuery([GroupComponent, BoundingBoxComponent, BoundingBoxDynamicTag])

const distanceFromLocalClientQuery = defineQuery([TransformComponent, DistanceFromLocalClientComponent])
const distanceFromCameraQuery = defineQuery([TransformComponent, DistanceFromCameraComponent])
const frustumCulledQuery = defineQuery([TransformComponent, FrustumCullCameraComponent])

export const computeLocalTransformMatrix = (entity: Entity) => {
  const localTransform = getComponent(entity, LocalTransformComponent)
  localTransform.matrix.compose(localTransform.position, localTransform.rotation, localTransform.scale)
}

export const computeTransformMatrix = (entity: Entity, world = Engine.instance.currentWorld) => {
  const transform = getComponent(entity, TransformComponent)
  updateTransformFromComputedTransform(entity)
  updateTransformFromLocalTransform(entity)
  transform.matrix.compose(transform.position, transform.rotation, transform.scale)
  transform.matrixInverse.copy(transform.matrix).invert()
}

export const teleportRigidbody = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const isAwake = !rigidBody.body.isSleeping()
  rigidBody.body.setTranslation(transform.position, isAwake)
  rigidBody.body.setRotation(transform.rotation, isAwake)
  rigidBody.body.setLinvel(V_000, isAwake)
  rigidBody.body.setAngvel(V_000, isAwake)
  rigidBody.previousPosition.copy(transform.position)
  rigidBody.position.copy(transform.position)
  rigidBody.previousRotation.copy(transform.rotation)
  rigidBody.rotation.copy(transform.rotation)
  // if scale has changed, we have to recreate the collider
  const scaleChanged = rigidBody.scale.manhattanDistanceTo(transform.scale) > 0.0001
  if (scaleChanged) {
    if (hasComponent(entity, GLTFLoadedComponent)) updateModelColliders(entity)
    else updateCollider(entity)
  }
}

export const lerpTransformFromRigidbody = (entity: Entity, alpha: number) => {
  /*
  Interpolate the remaining time after the fixed pipeline is complete.
  See https://gafferongames.com/post/fix_your_timestep/#the-final-touch
  */

  const previousPositionX = RigidBodyComponent.previousPosition.x[entity]
  const previousPositionY = RigidBodyComponent.previousPosition.y[entity]
  const previousPositionZ = RigidBodyComponent.previousPosition.z[entity]
  const previousRotationX = RigidBodyComponent.previousRotation.x[entity]
  const previousRotationY = RigidBodyComponent.previousRotation.y[entity]
  const previousRotationZ = RigidBodyComponent.previousRotation.z[entity]
  const previousRotationW = RigidBodyComponent.previousRotation.w[entity]

  const positionX = RigidBodyComponent.position.x[entity]
  const positionY = RigidBodyComponent.position.y[entity]
  const positionZ = RigidBodyComponent.position.z[entity]
  const rotationX = RigidBodyComponent.rotation.x[entity]
  const rotationY = RigidBodyComponent.rotation.y[entity]
  const rotationZ = RigidBodyComponent.rotation.z[entity]
  const rotationW = RigidBodyComponent.rotation.w[entity]

  TransformComponent.position.x[entity] = previousPositionX + (positionX - previousPositionX) * alpha
  TransformComponent.position.y[entity] = previousPositionY + (positionY - previousPositionY) * alpha
  TransformComponent.position.z[entity] = previousPositionZ + (positionZ - previousPositionZ) * alpha
  TransformComponent.rotation.x[entity] = previousRotationX + (rotationX - previousRotationX) * alpha
  TransformComponent.rotation.y[entity] = previousRotationY + (rotationY - previousRotationY) * alpha
  TransformComponent.rotation.z[entity] = previousRotationZ + (rotationZ - previousRotationZ) * alpha
  TransformComponent.rotation.w[entity] = previousRotationW + (rotationW - previousRotationW) * alpha

  Engine.instance.currentWorld.dirtyTransforms[entity] = true
}

const updateTransformFromLocalTransform = (entity: Entity) => {
  const localTransform = getOptionalComponent(entity, LocalTransformComponent)
  const parentTransform = localTransform?.parentEntity
    ? getOptionalComponent(localTransform.parentEntity, TransformComponent)
    : undefined
  if (!localTransform || !parentTransform) return false
  const transform = getComponent(entity, TransformComponent)
  transform.matrix.multiplyMatrices(parentTransform.matrix, localTransform.matrix)
  transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
  return true
}

const updateTransformFromComputedTransform = (entity: Entity) => {
  const computedTransform = getOptionalComponent(entity, ComputedTransformComponent)
  if (!computedTransform) return false
  computedTransform.computeFunction(entity, computedTransform.referenceEntity)
  return true
}

export const updateGroupChildren = (entity: Entity) => {
  const group = getComponent(entity, GroupComponent) as any as (Mesh & Camera)[]
  // drop down one level and update children
  for (const root of group) {
    for (const obj of root.children) {
      obj.updateMatrixWorld()
      obj.matrixWorldNeedsUpdate = false
    }
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

  const _frustum = new Frustum()
  const _projScreenMatrix = new Matrix4()

  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const transformDepths = new Map<Entity, number>()

  const updateTransformDepth = (entity: Entity) => {
    if (transformDepths.has(entity)) return transformDepths.get(entity)

    const referenceEntity = getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity
    const parentEntity = getOptionalComponent(entity, LocalTransformComponent)?.parentEntity

    const referenceEntityDepth = referenceEntity ? updateTransformDepth(referenceEntity) : 0
    const parentEntityDepth = parentEntity ? updateTransformDepth(parentEntity) : 0
    const depth = Math.max(referenceEntityDepth, parentEntityDepth) + 1
    transformDepths.set(entity, depth)

    return depth
  }

  const compareReferenceDepth = (a: Entity, b: Entity) => {
    const aDepth = transformDepths.get(a)!
    const bDepth = transformDepths.get(b)!
    return aDepth - bDepth
  }

  const traverseComputeBoundingBox = (mesh: Mesh) => {
    if (mesh.isMesh) mesh.geometry.computeBoundingBox()
  }

  const computeBoundingBox = (entity: Entity) => {
    const box = getComponent(entity, BoundingBoxComponent).box
    const group = getComponent(entity, GroupComponent)

    box.makeEmpty()

    for (const obj of group) {
      obj.traverse(traverseComputeBoundingBox)
      box.expandByObject(obj)
    }
  }

  const updateBoundingBox = (entity: Entity) => {
    const box = getComponent(entity, BoundingBoxComponent).box
    const group = getComponent(entity, GroupComponent)
    box.makeEmpty()
    for (const obj of group) box.expandByObject(obj)
  }

  const isDirty = (entity: Entity) => world.dirtyTransforms[entity]

  const filterCleanNonSleepingDynamicRigidbodies = (entity: Entity) =>
    !world.dirtyTransforms[entity] &&
    hasComponent(entity, RigidBodyDynamicTagComponent) &&
    !getComponent(entity, RigidBodyComponent).body.isSleeping()

  const invFilterCleanNonSleepingDynamicRigidbodies = (entity: Entity) =>
    !filterCleanNonSleepingDynamicRigidbodies(entity)

  let sortedTransformEntities = [] as Entity[]

  const execute = () => {
    // TODO: move entity tree mutation logic here for more deterministic and less redundant calculations

    // if transform order is dirty, sort by reference depth
    // Note: cyclic references will cause undefined behavior
    const { transformsNeedSorting } = getState(EngineState)

    let needsSorting = transformsNeedSorting.value

    for (const entity of transformQuery.enter()) {
      sortedTransformEntities.push(entity)
      needsSorting = true
    }

    for (const entity of transformQuery.exit()) {
      const idx = sortedTransformEntities.indexOf(entity)
      idx > -1 && sortedTransformEntities.splice(idx, 1)
      needsSorting = true
    }

    if (needsSorting) {
      transformDepths.clear()
      for (const entity of sortedTransformEntities) updateTransformDepth(entity)
      insertionSort(sortedTransformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
      transformsNeedSorting.set(false)
    }

    const allRigidbodyEntities = rigidbodyTransformQuery()
    const cleanDynamicRigidbodyEntities = allRigidbodyEntities.filter(filterCleanNonSleepingDynamicRigidbodies)
    const invCleanDynamicRigidbodyEntities = allRigidbodyEntities.filter(invFilterCleanNonSleepingDynamicRigidbodies)

    // lerp clean dynamic rigidbody entities (make them dirty)
    const fixedRemainder = world.elapsedSeconds - world.fixedElapsedSeconds
    const alpha = Math.min(fixedRemainder / getState(EngineState).fixedDeltaSeconds.value, 1)
    for (const entity of cleanDynamicRigidbodyEntities) lerpTransformFromRigidbody(entity, alpha)

    // entities with dirty parent or reference entities, or computed transforms, should also be dirty
    for (const entity of transformQuery()) {
      const makeDirty =
        world.dirtyTransforms[entity] ||
        world.dirtyTransforms[getOptionalComponent(entity, LocalTransformComponent)?.parentEntity ?? 0] ||
        world.dirtyTransforms[getOptionalComponent(entity, ComputedTransformComponent)?.referenceEntity ?? 0] ||
        hasComponent(entity, ComputedTransformComponent)
      if (makeDirty) world.dirtyTransforms[entity] = true
    }

    const dirtyRigidbodyEntities = invCleanDynamicRigidbodyEntities.filter(isDirty)
    const dirtyLocalTransformEntities = localTransformQuery().filter(isDirty)
    const dirtySortedTransformEntities = sortedTransformEntities.filter(isDirty)
    const dirtyGroupEntities = groupQuery().filter(isDirty)

    for (const entity of dirtyLocalTransformEntities) computeLocalTransformMatrix(entity)
    for (const entity of dirtySortedTransformEntities) computeTransformMatrix(entity, world)
    for (const entity of dirtyRigidbodyEntities) teleportRigidbody(entity)
    for (const entity of dirtyGroupEntities) updateGroupChildren(entity)

    for (const entity in world.dirtyTransforms) delete world.dirtyTransforms[entity]

    for (const entity of staticBoundingBoxQuery.enter()) computeBoundingBox(entity)
    for (const entity of dynamicBoundingBoxQuery()) updateBoundingBox(entity)

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (
          hasComponent(entity, BoundingBoxComponent) &&
          hasComponent(entity, TransformComponent) &&
          hasComponent(entity, GroupComponent)
        )
          updateBoundingBox(entity)
      }
    }

    const cameraPosition = getComponent(world.cameraEntity, TransformComponent).position
    for (const entity of distanceFromCameraQuery())
      DistanceFromCameraComponent.squaredDistance[entity] = getDistanceSquaredFromTarget(entity, cameraPosition)

    /** @todo expose the frustum in WebGLRenderer to not calculate this twice  */
    _projScreenMatrix.multiplyMatrices(world.camera.projectionMatrix, world.camera.matrixWorldInverse)
    _frustum.setFromProjectionMatrix(_projScreenMatrix)

    for (const entity of frustumCulledQuery())
      FrustumCullCameraComponent.isCulled[entity] = _frustum.containsPoint(
        getComponent(entity, TransformComponent).position
      )
        ? 0
        : 1

    if (entityExists(world, world.localClientEntity)) {
      const localClientPosition = getOptionalComponent(world.localClientEntity, TransformComponent)?.position
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

  const cleanup = async () => {
    world.sceneComponentRegistry.delete(TransformComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_TRANSFORM)

    removeActionQueue(modifyPropertyActionQueue)

    removeQuery(world, transformQuery)
    removeQuery(world, staticBoundingBoxQuery)
    removeQuery(world, dynamicBoundingBoxQuery)
    removeQuery(world, distanceFromLocalClientQuery)
    removeQuery(world, distanceFromCameraQuery)
  }

  return { execute, cleanup }
}
