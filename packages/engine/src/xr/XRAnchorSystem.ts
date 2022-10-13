import { MathUtils, Mesh, MeshBasicMaterial, Plane, Quaternion, RingGeometry, Vector3 } from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  removeQuery,
  setComponent
} from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { InputComponent } from '../input/components/InputComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { TouchInputs } from '../input/enums/InputEnums'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup, GroupComponent, removeGroupComponent } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../transform/components/TransformComponent'
import { updateEntityTransform } from '../transform/systems/TransformSystem'
import { InputSourceComponent, XRAnchorComponent, XRHitTestComponent, XRPointerComponent } from './XRComponents'
import { XRAction, XRReceptors, XRState } from './XRState'

const _vecPosition = new Vector3()
const _vecScale = new Vector3()
const _quat = new Quaternion()

const smoothedViewerHitResultPose = {
  position: new Vector3(),
  rotation: new Quaternion()
}
const smoothedSceneScale = new Vector3()

/**
 * Sets the origin reference space entity's transform to the results of
 * a hit test performed from the viewer's reference space.
 * @param entity
 */
export const updateHitTest = (entity: Entity) => {
  const xrState = getState(XRState)
  const xrFrame = Engine.instance.xrFrame!

  const hitTestComponent = getComponent(entity, XRHitTestComponent)

  if (hitTestComponent.hitTestSource.value) {
    const localTransform = getComponent(entity, LocalTransformComponent)
    const hitTestResults = xrFrame.getHitTestResults(hitTestComponent.hitTestSource.value!)
    if (hitTestResults.length) {
      const hit = hitTestResults[0]
      const hitPose = hit.getPose(xrState.originReferenceSpace.value!)!
      localTransform.position.copy(hitPose.transform.position as any as Vector3)
      localTransform.rotation.copy(hitPose.transform.orientation as any as Quaternion)
      hitTestComponent.hitTestResult.set(hit)
      return hit
    }
  }

  hitTestComponent.hitTestResult.set(null)
}

const _plane = new Plane()
let lastSwipeValue = null! as null | number

/**
 * Updates the transform of the origin reference space to manipulate the
 * camera inversely to represent scaling the scene.
 * @param world
 */
export const updatePlacementMode = (world = Engine.instance.currentWorld) => {
  const xrState = getState(XRState)

  const viewerHitTestEntity = xrState.viewerHitTestEntity.value

  updateEntityTransform(viewerHitTestEntity)

  /** Swipe to rotate */
  const viewerInputSourceEntity = xrState.viewerInputSourceEntity.value
  if (viewerInputSourceEntity) {
    const inputSource = getComponent(viewerInputSourceEntity, InputSourceComponent).inputSource
    const swipe = inputSource.gamepad?.axes ?? []
    if (swipe.length) {
      const delta = swipe[0] - (lastSwipeValue ?? 0)
      if (lastSwipeValue) xrState.sceneRotationOffset.set((val) => (val += delta / (world.deltaSeconds * 20)))
      lastSwipeValue = swipe[0]
    } else {
      lastSwipeValue = null
    }
  } else {
    lastSwipeValue = null
  }

  const hitLocalTransform = getComponent(viewerHitTestEntity, LocalTransformComponent)
  const cameraLocalTransform = getComponent(world.cameraEntity, LocalTransformComponent)

  const upDir = _vecPosition.set(0, 1, 0).applyQuaternion(hitLocalTransform.rotation)
  const dist = _plane
    .setFromNormalAndCoplanarPoint(upDir, hitLocalTransform.position)
    .distanceToPoint(cameraLocalTransform.position)

  /**
   * Lock lifesize to 1:1, whereas dollhouse mode uses
   * the distance from the camera to the hit test plane.
   */
  const minDollhouseScale = 0.01
  const maxDollhouseScale = 0.2
  const minDollhouseDist = 0.01
  const maxDollhouseDist = 0.6
  const lifeSize = dist > maxDollhouseDist && upDir.angleTo(V_010) < Math.PI * 0.02
  const targetScale = lifeSize
    ? 1
    : 1 /
      MathUtils.clamp(
        Math.pow((dist - minDollhouseDist) / maxDollhouseDist, 2) * maxDollhouseScale,
        minDollhouseScale,
        maxDollhouseScale
      )
  const targetScaleVector = _vecScale.setScalar(targetScale)
  const targetPosition = _vecPosition.copy(hitLocalTransform.position).multiplyScalar(targetScaleVector.x)
  const targetRotation = hitLocalTransform.rotation.multiply(
    _quat.setFromAxisAngle(V_010, xrState.sceneRotationOffset.value)
  )

  const lerpAlpha = 1 - Math.exp(-5 * world.deltaSeconds)
  smoothedViewerHitResultPose.position.lerp(targetPosition, lerpAlpha)
  smoothedViewerHitResultPose.rotation.slerp(targetRotation, lerpAlpha)
  smoothedSceneScale.lerp(targetScaleVector, lerpAlpha)

  /*
  Set the world origin based on the scene anchor
  */
  const worldOriginTransform = getComponent(world.originEntity, TransformComponent)
  worldOriginTransform.matrix.compose(
    smoothedViewerHitResultPose.position,
    smoothedViewerHitResultPose.rotation,
    _vecScale.setScalar(1)
  )
  worldOriginTransform.matrix.invert()
  worldOriginTransform.matrix.scale(smoothedSceneScale)
  worldOriginTransform.matrix.decompose(
    worldOriginTransform.position,
    worldOriginTransform.rotation,
    worldOriginTransform.scale
  )
}

export const updateAnchor = (entity: Entity, world = Engine.instance.currentWorld) => {
  const xrState = getState(XRState)
  const anchor = getComponent(entity, XRAnchorComponent).anchor.value
  const xrFrame = Engine.instance.xrFrame!
  if (anchor) {
    const pose = xrFrame.getPose(anchor.anchorSpace, xrState.originReferenceSpace.value!)
    if (pose) {
      const localTransform = getComponent(entity, LocalTransformComponent)
      localTransform.position.copy(pose.transform.position as any as Vector3)
      localTransform.rotation.copy(pose.transform.orientation as any as Quaternion)
    }
  }
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRAnchorSystem(world: World) {
  const xrState = getState(XRState)

  const scenePlacementEntity = createEntity()
  setComponent(scenePlacementEntity, NameComponent, { name: 'xr-scene-placement' })
  setLocalTransformComponent(scenePlacementEntity, world.originEntity)
  setComponent(scenePlacementEntity, VisibleComponent, true)

  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)
  const changePlacementModeQueue = createActionQueue(XRAction.changePlacementMode.matches)

  xrState.viewerHitTestEntity.set(scenePlacementEntity)

  // addObjectToGroup(viewerHitTestEntity, new AxesHelper(10))

  const xrViewerHitTestMesh = new Mesh(new RingGeometry(0.08, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  xrViewerHitTestMesh.geometry.rotateX(-Math.PI / 2)

  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])
  const xrAnchorQuery = defineQuery([XRAnchorComponent, TransformComponent])

  const execute = () => {
    for (const action of xrSessionChangedQueue()) {
      if (action.active) {
        if (xrState.sessionMode.value === 'immersive-ar') {
          const session = EngineRenderer.instance.xrSession
          session.requestReferenceSpace('viewer').then((viewerReferenceSpace) => {
            const xrState = getState(XRState)
            xrState.viewerReferenceSpace.set(viewerReferenceSpace)
            if ('requestHitTestSource' in session) {
              session.requestHitTestSource!({ space: viewerReferenceSpace })!
                .then((source) => {
                  xrState.viewerHitTestSource.set(source)
                })
                .catch((err) => {
                  console.warn('Failed to requestHitTestSource', err)
                })
            }
          })
        }
      } else {
        setTransformComponent(world.originEntity) // reset world origin
        xrState.viewerReferenceSpace.set(null)
        xrState.scenePlacementMode.set(false)
        hasComponent(world.originEntity, XRAnchorComponent) && removeComponent(world.originEntity, XRAnchorComponent)

        for (const e of xrHitTestQuery()) removeComponent(e, XRHitTestComponent)
        for (const e of xrAnchorQuery()) removeComponent(e, XRAnchorComponent)
      }
    }

    if (!Engine.instance.xrFrame) return

    const changePlacementModeActions = changePlacementModeQueue()
    for (const action of changePlacementModeActions) {
      XRReceptors.scenePlacementMode(action)
    }

    if (!!Engine.instance.xrFrame?.getHitTestResults && xrState.viewerHitTestSource.value) {
      if (changePlacementModeActions.length && changePlacementModeActions[0].active) {
        setComponent(scenePlacementEntity, XRHitTestComponent, {
          hitTestSource: xrState.viewerHitTestSource.get({ noproxy: true })
        })
      }
      for (const entity of xrHitTestQuery()) {
        const hit = updateHitTest(entity)
        if (entity === scenePlacementEntity && hit && changePlacementModeActions.length) {
          if (changePlacementModeActions[0].active) {
            hasComponent(entity, XRAnchorComponent) && removeComponent(entity, XRAnchorComponent)
          } else {
            // detect support for anchors
            if (typeof hit.createAnchor === 'function') {
              // @ts-ignore - types are incorrect for frame.createAnchor
              hit.createAnchor().then((anchor: XRAnchor) => {
                setComponent(entity, XRAnchorComponent, { anchor })
              })
            }
            hasComponent(entity, XRHitTestComponent) && removeComponent(entity, XRHitTestComponent)
          }
        }
      }
    }

    if (xrState.scenePlacementMode.value) {
      updatePlacementMode(world)
    }

    for (const entity of xrAnchorQuery()) updateAnchor(entity, world)

    /**
     * Hit Test Helper
     */
    for (const entity of xrHitTestQuery()) {
      const hasHit = getComponent(entity, XRHitTestComponent).hitTestResult.value
      if (hasHit && !hasComponent(entity, GroupComponent)) {
        addObjectToGroup(entity, xrViewerHitTestMesh)
      }
      if (!hasHit && hasComponent(entity, GroupComponent)) {
        removeGroupComponent(entity)
      }
    }

    for (const entity of xrHitTestQuery.exit()) {
      removeGroupComponent(entity)
    }
  }

  const cleanup = async () => {
    removeQuery(world, xrHitTestQuery)
    removeActionQueue(xrSessionChangedQueue)
  }

  return { execute, cleanup }
}
