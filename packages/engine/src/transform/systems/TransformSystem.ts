import { entityExists } from 'bitecs'
import { Camera, Mesh, Quaternion, Vector3 } from 'three'

import { insertionSort } from '@xrengine/common/src/utils/insertionSort'
import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { updateReferenceSpace } from '../../avatar/functions/moveAvatar'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent, BoundingBoxDynamicTag } from '../../interaction/components/BoundingBoxComponents'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { GLTFLoadedComponent } from '../../scene/components/GLTFLoadedComponent'
import { GroupComponent } from '../../scene/components/GroupComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { updateCollider, updateModelColliders } from '../../scene/functions/loaders/ColliderFunctions'
import { deserializeTransform, serializeTransform } from '../../scene/functions/loaders/TransformFunctions'
import { ComputedTransformComponent } from '../components/ComputedTransformComponent'
import { DistanceFromCameraComponent, DistanceFromLocalClientComponent } from '../components/DistanceComponents'
import {
  LocalTransformComponent,
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES,
  TransformComponent
} from '../components/TransformComponent'

const scratchVector3 = new Vector3()
const scratchQuaternion = new Quaternion()

const transformQuery = defineQuery([TransformComponent])

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
      if (hasComponent(entity, GLTFLoadedComponent)) updateModelColliders(entity)
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

  if (rigidBody.body.isSleeping()) {
    transform.position.copy(bodyPosition)
    transform.rotation.copy(bodyRotation)
  } else {
    transform.position.copy(rigidBody.previousPosition).lerp(scratchVector3.copy(bodyPosition), alpha)
    transform.rotation.copy(rigidBody.previousRotation).slerp(scratchQuaternion.copy(bodyRotation), alpha)
    velocity.linear
      .copy(rigidBody.previousLinearVelocity)
      .lerp(scratchVector3.copy(rigidBody.body.linvel() as Vector3), alpha)
    velocity.angular
      .copy(rigidBody.previousAngularVelocity)
      .lerp(scratchVector3.copy(rigidBody.body.angvel() as Vector3), alpha)
  }

  transform.matrix.compose(transform.position, transform.rotation, transform.scale)

  if (localTransform) {
    const parentTransform = getComponent(localTransform.parentEntity, TransformComponent) || transform
    localTransform.matrix.multiplyMatrices(parentTransform.matrixInverse, transform.matrix)
    localTransform.matrix.decompose(localTransform.position, localTransform.rotation, localTransform.scale)
    updateTransformFromLocalTransform(entity)
  }
}

export const updateEntityTransform = (entity: Entity, world = Engine.instance.currentWorld) => {
  const transform = getComponent(entity, TransformComponent)
  if (!transform) return

  const computedTransform = getComponent(entity, ComputedTransformComponent)
  const group = getComponent(entity, GroupComponent) as any as (Mesh & Camera)[]

  updateTransformFromLocalTransform(entity)
  updateTransformFromRigidbody(entity)

  if (computedTransform && hasComponent(computedTransform.referenceEntity, TransformComponent)) {
    computedTransform?.computeFunction(entity, computedTransform.referenceEntity)
  }

  if (world.dirtyTransforms.has(entity)) {
    // avoid scale 0 to prevent NaN errors
    // transform.scale.x = Math.max(1e-10, transform.scale.x)
    // transform.scale.y = Math.max(1e-10, transform.scale.y)
    // transform.scale.z = Math.max(1e-10, transform.scale.z)
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

  const transformDepths = new Map<Entity, number>()

  const updateTransformDepth = (entity: Entity) => {
    if (transformDepths.has(entity)) return transformDepths.get(entity)

    const referenceEntity = getComponent(entity, ComputedTransformComponent)?.referenceEntity
    const parentEntity = getComponent(entity, LocalTransformComponent)?.parentEntity

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

  const execute = () => {
    // TODO: move entity tree mutation logic here for more deterministic and less redundant calculations

    // if transform order is dirty, sort by reference depth
    const { transformsNeedSorting } = getState(EngineState)
    const transformEntities = transformQuery()

    if (transformsNeedSorting.value) {
      transformDepths.clear()
      for (const entity of transformEntities) updateTransformDepth(entity)
      insertionSort(transformEntities, compareReferenceDepth) // Insertion sort is speedy O(n) for mostly sorted arrays
      transformsNeedSorting.set(false)
    }

    // Note: cyclic references will cause undefined behavior

    // TODO: try to split transform update logic apart into multiple iterations for improved cpu prediction:
    //  1) update dirty local transform matrices
    //  2) apply dirty world transforms to rigidbodies (physics teleport, and also copy to previous physics position/rotation for interpolation)
    //  3) readback rigidbody transforms and calculate interpolated transforms
    //  4) update all dirty computed and local to world transform matrices (IMPORTANT: strictly ordered by reference depth)
    //  5) call updateMatrixWorld on group children
    for (const entity of transformEntities) updateEntityTransform(entity, world)

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
