import { useEffect } from 'react'
import {
  AxesHelper,
  ConeGeometry,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshNormalMaterial,
  Plane,
  Quaternion,
  Ray,
  RingGeometry,
  SphereGeometry,
  Vector3
} from 'three'

import { smootheLerpAlpha } from '@etherealengine/common/src/utils/smootheLerpAlpha'
import {
  createActionQueue,
  getMutableState,
  removeActionQueue,
  startReactor,
  useState
} from '@etherealengine/hyperflux'

import { V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import {
  ComponentType,
  defineQuery,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  removeComponent,
  removeQuery,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../ecs/functions/ComponentFunctions'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { addObjectToGroup, removeObjectFromGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { ObjectLayers } from '../scene/constants/ObjectLayers'
import { setObjectLayers } from '../scene/functions/setObjectLayers'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../transform/components/TransformComponent'
import { updateWorldOriginFromScenePlacement } from '../transform/updateWorldOrigin'
import { XRAnchorComponent, XRHitTestComponent } from './XRComponents'
import { ReferenceSpace, XRAction, XRState } from './XRState'

export const updateHitTest = (entity: Entity) => {
  const xrFrame = Engine.instance.xrFrame!
  const hitTest = getMutableComponent(entity, XRHitTestComponent)
  const localTransform = getComponent(entity, LocalTransformComponent)
  const hitTestResults = (hitTest.source.value && xrFrame.getHitTestResults(hitTest.source.value!)) ?? []
  hitTest.results.set(hitTestResults)
  const space = ReferenceSpace.localFloor // xrFrame.session.interactionMode === 'world-space' ? ReferenceSpace.localFloor! : ReferenceSpace.viewer!
  const pose = space && hitTestResults?.length && hitTestResults[0].getPose(space)
  if (pose) {
    localTransform.parentEntity =
      space === ReferenceSpace.localFloor ? Engine.instance.originEntity : Engine.instance.cameraEntity
    localTransform.position.copy(pose.transform.position as any)
    localTransform.rotation.copy(pose.transform.orientation as any)
  }
}

export const updateAnchor = (entity: Entity) => {
  const xrFrame = Engine.instance.xrFrame!
  const anchor = getComponent(entity, XRAnchorComponent).anchor
  const localTransform = getComponent(entity, LocalTransformComponent)
  const pose = ReferenceSpace.localFloor && xrFrame.getPose(anchor.anchorSpace, ReferenceSpace.localFloor)
  if (pose) {
    localTransform.position.copy(pose.transform.position as any)
    localTransform.rotation.copy(pose.transform.orientation as any)
  }
}

const _plane = new Plane()
const _vecPosition = new Vector3()
const _vecScale = new Vector3()
const _quat = new Quaternion()
const _quat180 = new Quaternion().setFromAxisAngle(V_010, Math.PI)

// const _vec = new Vector3()
// const _vec2 = new Vector3()
// const _quat2 = new Quaternion()
// const _ray = new Ray()

// const pos = new Vector3()
// const orient = new Quaternion()

/** AR placement for immersive session */
// export const getHitTestFromController = () => {
//   const referenceSpace = ReferenceSpace.origin!
//   const pose = Engine.instance.xrFrame!.getPose(Engine.instance.inputSources[0].targetRaySpace, referenceSpace)!
//   const { position, orientation } = pose.transform

//   pos.copy(position as any as Vector3)
//   orient.copy(orientation as any as Quaternion)

//   // raycast controller to ground
//   _ray.set(pos, _vec2.set(0, 0, -1).applyQuaternion(orient))
//   const hit = _ray.intersectPlane(_plane.set(V_010, 0), _vec)

//   if (!hit) return

//   /** swing twist quaternion decomposition to get the rotation around Y axis */
//   extractRotationAboutAxis(orient, V_010, _quat2)

//   _quat2.multiply(_quat180)

//   return {
//     position: _vec,
//     rotation: _quat2
//   }
// }

/** AR placement for non immersive / mobile session */
// export const getHitTestFromViewer = () => {
//   const xrState = getMutableState(XRState)

//   const viewerHitTestEntity = xrState.viewerHitTestEntity.value

//   computeTransformMatrix(viewerHitTestEntity)

//   const hitTestComponent = getComponent(viewerHitTestEntity, XRHitTestComponent)

/** Swipe to rotate */
// TODO; move into interactable after spatial input refactor
// if (hitTestComponent?.hitTestResult) {
//   const placementInputSource = xrState.scenePlacementMode.value!
//   const swipe = placementInputSource.gamepad?.axes ?? []
//   if (swipe.length) {
//     const delta = swipe[0] - (lastSwipeValue ?? 0)
//     if (lastSwipeValue) xrState.sceneRotationOffset.set((val) => (val += delta / (Engine.instance.deltaSeconds * 20)))
//     lastSwipeValue = swipe[0]
//   } else {
//     lastSwipeValue = null
//   }
// } else {
//   lastSwipeValue = null
// }

//   return getComponent(viewerHitTestEntity, TransformComponent)
// }

// let lastSwipeValue = null! as null | number

const getTargetWorldSize = (localTransform: ComponentType<typeof LocalTransformComponent>) => {
  const xrState = getMutableState(XRState)
  const placing = xrState.scenePlacementMode.value === 'placing'
  if (!placing) return xrState.sceneScale.value

  const xrSession = xrState.session.value!
  const xrFrame = Engine.instance.xrFrame
  if (!xrFrame) return 1

  const viewerPose = xrFrame.getViewerPose(ReferenceSpace.localFloor!)
  if (!viewerPose) return 1

  const upDir = _vecPosition.set(0, 1, 0).applyQuaternion(localTransform.rotation)
  const dist = _plane
    .setFromNormalAndCoplanarPoint(upDir, localTransform.position)
    .distanceToPoint(viewerPose.transform.position as any)

  /**
   * Lock lifesize to 1:1, whereas dollhouse mode uses
   * the distance from the camera to the hit test plane.
   */
  const minDollhouseScale = 0.01
  const maxDollhouseScale = 0.2
  const minDollhouseDist = 0.01
  const maxDollhouseDist = 0.6
  const lifeSize =
    xrSession.interactionMode === 'world-space' || (dist > maxDollhouseDist && upDir.angleTo(V_010) < Math.PI * 0.02)

  if (lifeSize) return 1

  const targetScale = lifeSize
    ? 1
    : MathUtils.clamp(
        Math.pow((dist - minDollhouseDist) / maxDollhouseDist, 2) * maxDollhouseScale,
        minDollhouseScale,
        maxDollhouseScale
      )

  return targetScale
}

export const updateScenePlacement = (scenePlacementEntity: Entity) => {
  // assumes local transform is relative to origin
  let localTransform = getComponent(scenePlacementEntity, LocalTransformComponent)

  const xrFrame = Engine.instance.xrFrame
  const xrState = getMutableState(XRState)
  const xrSession = xrState.session.value

  if (!localTransform || !xrFrame || !xrSession) return

  const lerpAlpha = smootheLerpAlpha(5, Engine.instance.deltaSeconds)

  const targetScale = getTargetWorldSize(localTransform)
  if (targetScale !== xrState.sceneScale.value)
    xrState.sceneScale.set(MathUtils.lerp(xrState.sceneScale.value, targetScale, lerpAlpha))

  const targetPosition = _vecPosition.copy(localTransform.position) //.multiplyScalar(1 / xrState.sceneScale.value)
  const targetRotation = localTransform.rotation.multiply(
    _quat.setFromAxisAngle(V_010, xrState.sceneRotationOffset.value)
  )

  xrState.scenePosition.value.copy(targetPosition)
  xrState.sceneRotation.value.copy(targetRotation)
  // xrState.scenePosition.value.lerp(targetPosition, lerpAlpha)
  // xrState.sceneRotation.value.slerp(targetRotation, lerpAlpha)
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRAnchorSystem() {
  const xrState = getMutableState(XRState)

  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const scenePlacementRingMesh = new Mesh(new RingGeometry(0.08, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  scenePlacementRingMesh.geometry.rotateX(-Math.PI / 2)
  scenePlacementRingMesh.geometry.translate(0, 0.01, 0)

  const pinSphereMesh = new Mesh(new SphereGeometry(0.025, 16, 16), new MeshBasicMaterial({ color: 'white' }))
  pinSphereMesh.position.setY(0.1125)
  const pinConeMesh = new Mesh(new ConeGeometry(0.01, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  pinConeMesh.position.setY(0.05)
  pinConeMesh.rotateX(Math.PI)

  const worldOriginPinpointAnchor = new Group()
  worldOriginPinpointAnchor.name = 'world-origin-pinpoint-anchor'
  worldOriginPinpointAnchor.add(pinSphereMesh, pinConeMesh)
  worldOriginPinpointAnchor.add(scenePlacementRingMesh)
  worldOriginPinpointAnchor.updateMatrixWorld(true)

  const scenePlacementEntity = createEntity()
  setComponent(scenePlacementEntity, NameComponent, 'xr-scene-placement')
  setLocalTransformComponent(scenePlacementEntity, Engine.instance.originEntity)
  setComponent(scenePlacementEntity, VisibleComponent, true)

  const originAxesHelper = new AxesHelper(10000)
  setObjectLayers(originAxesHelper, ObjectLayers.Gizmos)
  addObjectToGroup(scenePlacementEntity, originAxesHelper)

  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])
  const xrAnchorQuery = defineQuery([XRAnchorComponent, TransformComponent])

  const scenePlacementReactor = startReactor(function ScenePlancementReactor() {
    const scenePlacementMode = useState(xrState.scenePlacementMode)
    const xrSession = useState(xrState.session)
    const hitTest = useOptionalComponent(scenePlacementEntity, XRHitTestComponent)

    useEffect(() => {
      if (!xrSession.value) return

      let active = true

      if (scenePlacementMode.value === 'unplaced') {
        removeComponent(scenePlacementEntity, XRHitTestComponent)
        removeComponent(scenePlacementEntity, XRAnchorComponent)
        worldOriginPinpointAnchor.removeFromParent()
        return
      }

      if (scenePlacementMode.value === 'placing') {
        // create a hit test source for the viewer when the interaction mode is 'screen-space'
        if (xrSession.value.interactionMode === 'screen-space') {
          Engine.instance.scene.add(worldOriginPinpointAnchor)
          setComponent(scenePlacementEntity, XRHitTestComponent, {
            space: ReferenceSpace.viewer!,
            entityTypes: ['plane', 'point', 'mesh']
          })
        }

        // for scene placement in 'world-space', we should request a hit test source when an input source is gripped,
        // and assign it to the scene placement entity
        if (xrSession.value.interactionMode === 'world-space') {
          // @todo: handle world-space scene placement
        }
        return
      }

      if (scenePlacementMode.value === 'placed') {
        worldOriginPinpointAnchor.removeFromParent()
        const hitTestResult = hitTest?.results?.value?.[0]
        if (hitTestResult) {
          if (!hitTestResult.createAnchor) {
            const xrFrame = Engine.instance.xrFrame
            const hitPose = ReferenceSpace.localFloor && hitTestResult.getPose(ReferenceSpace.localFloor)
            hitPose &&
              xrFrame?.createAnchor?.(hitPose.transform, ReferenceSpace.localFloor!)?.then((anchor) => {
                if (!active) {
                  anchor.delete()
                  return
                }
                setComponent(scenePlacementEntity, XRAnchorComponent, { anchor })
              })
            removeComponent(scenePlacementEntity, XRHitTestComponent)
            return
          }
          // @ts-ignore createAnchor function is not typed correctly
          const anchorPromise = hitTestResult.createAnchor()
          if (anchorPromise)
            anchorPromise
              .then((anchor) => {
                if (!active) {
                  anchor.delete()
                  return
                }
                setComponent(scenePlacementEntity, XRAnchorComponent, { anchor })
                removeComponent(scenePlacementEntity, XRHitTestComponent)
              })
              .catch(() => {
                removeComponent(scenePlacementEntity, XRHitTestComponent)
              })
          else removeComponent(scenePlacementEntity, XRHitTestComponent)
        }
      }

      return () => {
        active = false
      }
    }, [scenePlacementMode, xrSession, hitTest])

    return null
  })

  const cleanup = async () => {
    removeQuery(xrHitTestQuery)
    removeActionQueue(xrSessionChangedQueue)
    await scenePlacementReactor.stop()
  }

  const execute = () => {
    for (const action of xrSessionChangedQueue()) {
      if (!action.active) {
        setTransformComponent(Engine.instance.originEntity) // reset world origin
        xrState.scenePlacementMode.set('unplaced')
        for (const e of xrHitTestQuery()) removeComponent(e, XRHitTestComponent)
        for (const e of xrAnchorQuery()) removeComponent(e, XRAnchorComponent)
      }
    }

    if (!Engine.instance.xrFrame) return

    for (const entity of xrAnchorQuery()) updateAnchor(entity)
    for (const entity of xrHitTestQuery()) updateHitTest(entity)

    if (xrState.scenePlacementMode.value !== 'unplaced') {
      updateScenePlacement(scenePlacementEntity)
      updateWorldOriginFromScenePlacement()
    }
  }

  return { execute, cleanup }
}
