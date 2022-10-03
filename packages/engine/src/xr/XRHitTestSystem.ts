import { Mesh, MeshBasicMaterial, Quaternion, RingGeometry, Vector3 } from 'three'

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
import { TouchInputs } from '../input/enums/InputEnums'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { addObjectToGroup, GroupComponent, removeGroupComponent } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  TransformComponent
} from '../transform/components/TransformComponent'
import { updateEntityTransform } from '../transform/systems/TransformSystem'
import { XRAnchorComponent, XRHitTestComponent } from './XRComponents'
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
    const transform = getComponent(entity, LocalTransformComponent)
    const hitTestResults = xrFrame.getHitTestResults(hitTestComponent.hitTestSource.value!)

    if (hitTestResults.length) {
      const hit = hitTestResults[0]
      const hitData = hit.getPose(xrState.originReferenceSpace.value!)!
      transform.matrix.fromArray(hitData.transform.matrix)
      transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
      hitTestComponent.hitTestResult.set(hit)
      return hit
    }
  }

  hitTestComponent.hitTestResult.set(null)
}

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
  const touchInput = world.inputState.get(TouchInputs.Touch1Movement)
  if (touchInput && touchInput.lifecycleState === 'Changed') {
    xrState.sceneRotationOffset.set((val) => (val += touchInput.value[0] / (world.deltaSeconds * 2)))
  }

  const hitLocalTransform = getComponent(viewerHitTestEntity, LocalTransformComponent)
  const cameraLocalTransform = getComponent(world.cameraEntity, LocalTransformComponent)
  const dist = cameraLocalTransform.position.distanceTo(hitLocalTransform.position)

  const upDir = _vecPosition.set(0, 1, 0).applyQuaternion(hitLocalTransform.rotation)
  const lifeSize = dist > 1 && upDir.angleTo(V_010) < Math.PI * 0.02

  const lerpAlpha = 1 - Math.exp(-5 * world.deltaSeconds)
  const targetScale = _vecScale.setScalar(lifeSize ? 1 : 1 / xrState.sceneDollhouseScale.value)
  const targetPosition = _vecPosition.copy(hitLocalTransform.position).multiplyScalar(targetScale.x)
  const targetRotation = hitLocalTransform.rotation.multiply(
    _quat.setFromAxisAngle(V_010, xrState.sceneRotationOffset.value)
  )

  smoothedViewerHitResultPose.position.lerp(targetPosition, lerpAlpha)
  smoothedViewerHitResultPose.rotation.slerp(targetRotation, lerpAlpha)
  smoothedSceneScale.lerp(targetScale, lerpAlpha)

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
      const transform = getComponent(entity, LocalTransformComponent) ?? getComponent(entity, TransformComponent)
      transform.position.copy(pose.transform.position as any as Vector3)
      transform.rotation.copy(pose.transform.orientation as any as Quaternion)
      world.dirtyTransforms.add(entity)
    }
  }
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRHitTestSystem(world: World) {
  const xrState = getState(XRState)

  const viewerHitTestEntity = createEntity()
  setComponent(viewerHitTestEntity, NameComponent, { name: 'xr-viewer-hit-test' })
  setLocalTransformComponent(viewerHitTestEntity, world.originEntity)
  setComponent(viewerHitTestEntity, VisibleComponent, true)
  setComponent(viewerHitTestEntity, XRHitTestComponent, { hitTestSource: null })

  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)
  const changePlacementModeQueue = createActionQueue(XRAction.changePlacementMode.matches)

  xrState.viewerHitTestEntity.set(viewerHitTestEntity)

  // addObjectToGroup(viewerHitTestEntity, new AxesHelper(10))

  const xrViewerHitTestMesh = new Mesh(new RingGeometry(0.08, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  xrViewerHitTestMesh.geometry.rotateX(-Math.PI / 2)

  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])
  const xrAnchorQuery = defineQuery([XRAnchorComponent, TransformComponent])

  const execute = () => {
    if (!Engine.instance.xrFrame) return

    for (const action of xrSessionChangedQueue()) {
      if (action.active) {
        if (xrState.sessionMode.value === 'immersive-ar') {
          const session = EngineRenderer.instance.xrSession
          session.requestReferenceSpace('viewer').then((viewerReferenceSpace) => {
            const xrState = getState(XRState)
            xrState.viewerReferenceSpace.set(viewerReferenceSpace)
            if ('requestHitTestSource' in session) {
              session.requestHitTestSource!({ space: viewerReferenceSpace })!.then((source) => {
                xrState.viewerHitTestSource.set(source)
                getComponent(viewerHitTestEntity, XRHitTestComponent).hitTestSource.set(source)
              })
            }
          })
        }
      } else {
        xrState.viewerReferenceSpace.set(null)
        removeComponent(world.originEntity, XRAnchorComponent)
      }
    }

    const changePlacementModeActions = changePlacementModeQueue()
    for (const action of changePlacementModeActions) {
      XRReceptors.scenePlacementMode(action)
    }

    if (!!Engine.instance.xrFrame?.getHitTestResults && xrState.viewerHitTestSource.value) {
      for (const entity of xrHitTestQuery()) {
        const hit = updateHitTest(entity)
        if (
          entity === viewerHitTestEntity &&
          hit &&
          changePlacementModeActions.length &&
          !changePlacementModeActions[0].active &&
          typeof hit.createAnchor === 'function'
        ) {
          // @ts-ignore - types are incorrect for hit.createAnchor
          hit.createAnchor().then((anchor: XRAnchor) => {
            setComponent(world.originEntity, XRAnchorComponent, { anchor })
          })
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
  }

  const cleanup = async () => {
    removeQuery(world, xrHitTestQuery)
    removeActionQueue(xrSessionChangedQueue)
  }

  return { execute, cleanup }
}
