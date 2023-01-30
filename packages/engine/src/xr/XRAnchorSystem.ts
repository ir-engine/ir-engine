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

import { smootheLerpAlpha } from '@xrengine/common/src/utils/smootheLerpAlpha'
import { createActionQueue, getState, removeActionQueue, startReactor, useState } from '@xrengine/hyperflux'

import { V_010 } from '../common/constants/MathConstants'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import {
  defineQuery,
  getComponent,
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
  const hitTest = getComponent(entity, XRHitTestComponent)
  const localTransform = getComponent(entity, LocalTransformComponent)
  const hitTestResults = (hitTest.hitTestResults =
    hitTest.hitTestSource && xrFrame.getHitTestResults(hitTest.hitTestSource!))
  const pose =
    hitTestResults?.length && ReferenceSpace.localFloor && hitTestResults[0].getPose(ReferenceSpace.localFloor)
  if (pose) {
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
// export const getHitTestFromController = (world = Engine.instance.currentWorld) => {
//   const referenceSpace = ReferenceSpace.origin!
//   const pose = Engine.instance.xrFrame!.getPose(world.inputSources[0].targetRaySpace, referenceSpace)!
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
// export const getHitTestFromViewer = (world = Engine.instance.currentWorld) => {
//   const xrState = getState(XRState)

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
//     if (lastSwipeValue) xrState.sceneRotationOffset.set((val) => (val += delta / (world.deltaSeconds * 20)))
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

/**
 * Updates the transform of the origin reference space to manipulate the
 * camera inversely to represent scaling the scene.
 */
export const updateScenePlacement = (scenePlacementEntity: Entity) => {
  // assumes local transform is relative to origin
  const localTransform = getComponent(scenePlacementEntity, LocalTransformComponent)
  const xrFrame = Engine.instance.xrFrame
  const viewerPose = xrFrame?.getViewerPose(ReferenceSpace.localFloor!)
  const xrState = getState(XRState)
  const xrSession = xrState.session.value

  if (!localTransform || !xrFrame || !xrSession || !viewerPose) return

  const world = Engine.instance.currentWorld
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
  const targetScale = lifeSize
    ? 1
    : 1 /
      MathUtils.clamp(
        Math.pow((dist - minDollhouseDist) / maxDollhouseDist, 2) * maxDollhouseScale,
        minDollhouseScale,
        maxDollhouseScale
      )

  const targetPosition = _vecPosition.copy(localTransform.position).multiplyScalar(targetScale)
  const targetRotation = localTransform.rotation.multiply(
    _quat.setFromAxisAngle(V_010, xrState.sceneRotationOffset.value)
  )

  const lerpAlpha = smootheLerpAlpha(5, world.deltaSeconds)
  xrState.scenePosition.value.lerp(targetPosition, lerpAlpha)
  xrState.sceneRotation.value.slerp(targetRotation, lerpAlpha)
  xrState.sceneScale.set(MathUtils.lerp(xrState.sceneScale.value, targetScale, lerpAlpha))
}

function updateScenePlacementRingMesh(scenePlacementEntity: Entity, scenePlacementRingMesh: Mesh) {
  const scenePlacementHitTest = getOptionalComponent(scenePlacementEntity, XRHitTestComponent)
  if (scenePlacementHitTest?.hitTestResults[0]) {
    addObjectToGroup(scenePlacementEntity, scenePlacementRingMesh)
  } else {
    removeObjectFromGroup(scenePlacementEntity, scenePlacementRingMesh)
  }
}

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRAnchorSystem(world: World) {
  const xrState = getState(XRState)

  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)

  const pinSphereMesh = new Mesh(new SphereGeometry(0.025, 16, 16), new MeshBasicMaterial({ color: 'white' }))
  pinSphereMesh.position.setY(0.1125)
  const pinConeMesh = new Mesh(new ConeGeometry(0.01, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  pinConeMesh.position.setY(0.05)
  pinConeMesh.rotateX(Math.PI)
  const worldOriginPinpointAnchor = new Group()
  worldOriginPinpointAnchor.name = 'world-origin-pinpoint-anchor'
  worldOriginPinpointAnchor.add(pinSphereMesh, pinConeMesh)

  const scenePlacementEntity = createEntity()
  setComponent(scenePlacementEntity, NameComponent, 'xr-scene-placement')
  setLocalTransformComponent(scenePlacementEntity, world.originEntity)
  setComponent(scenePlacementEntity, VisibleComponent, true)

  const originAxesHelper = new AxesHelper(10000)
  setObjectLayers(originAxesHelper, ObjectLayers.Gizmos)
  addObjectToGroup(scenePlacementEntity, originAxesHelper)

  const scenePlacementRingMesh = new Mesh(new RingGeometry(0.08, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  scenePlacementRingMesh.geometry.rotateX(-Math.PI / 2)

  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])
  const xrAnchorQuery = defineQuery([XRAnchorComponent, TransformComponent])

  const scenePlacementReactor = startReactor(() => {
    const scenePlacementMode = useState(xrState.scenePlacementMode)
    const xrSession = useState(xrState.session)
    const hitTest = useOptionalComponent(scenePlacementEntity, XRHitTestComponent)

    useEffect(() => {
      if (scenePlacementMode.value === 'unplaced') {
        removeComponent(scenePlacementEntity, XRHitTestComponent)
        removeComponent(scenePlacementEntity, XRAnchorComponent)
        worldOriginPinpointAnchor.removeFromParent()
        return
      }

      if (scenePlacementMode.value === 'placing') {
        // create a hit test source for the viewer when the interaction mode is 'screen-space'
        if (xrSession.value?.requestHitTestSource && xrSession.value.interactionMode === 'screen-space') {
          Engine.instance.currentWorld.scene.add(worldOriginPinpointAnchor)

          xrSession.value.requestHitTestSource({ space: ReferenceSpace.viewer! })?.then((hitTestSource) => {
            setComponent(scenePlacementEntity, XRHitTestComponent, { hitTestSource })
          })
        }

        // for scene placement in 'world-space', we should request a hit test source when an input source is gripped,
        // and assign it to the scene placement entity
        if (xrSession.value?.requestHitTestSource && xrSession.value.interactionMode === 'world-space') {
          // @todo: handle world-space scene placement
        }
      } else if (scenePlacementMode.value === 'placed') {
        const hitTestResult = hitTest?.hitTestResults[0]
        if (hitTestResult) {
          if (!hitTestResult.createAnchor) {
            removeComponent(scenePlacementEntity, XRHitTestComponent)
            return
          }
          // @ts-ignore createAnchor function is not typed correctly
          hitTestResult
            .createAnchor()
            .then((anchor) => {
              setComponent(scenePlacementEntity, XRAnchorComponent, { anchor })
              removeComponent(scenePlacementEntity, XRHitTestComponent)
            })
            .catch(() => {
              removeComponent(scenePlacementEntity, XRHitTestComponent)
            })
        }
      }
    }, [scenePlacementMode, xrSession, hitTest])

    return null
  })

  const cleanup = async () => {
    removeQuery(world, xrHitTestQuery)
    removeActionQueue(xrSessionChangedQueue)
    scenePlacementReactor.stop()
  }

  const execute = () => {
    for (const action of xrSessionChangedQueue()) {
      if (!action.active) {
        setTransformComponent(world.originEntity) // reset world origin
        xrState.scenePlacementMode.set('unplaced')
        for (const e of xrHitTestQuery()) removeComponent(e, XRHitTestComponent)
        for (const e of xrAnchorQuery()) removeComponent(e, XRAnchorComponent)
      }
    }

    if (!Engine.instance.xrFrame) return

    for (const entity of xrAnchorQuery()) updateAnchor(entity)
    for (const entity of xrHitTestQuery()) updateHitTest(entity)

    if (xrState.scenePlacementMode.value !== 'unplaced') {
      updateScenePlacementRingMesh(scenePlacementEntity, scenePlacementRingMesh)
      updateScenePlacement(scenePlacementEntity)
      updateWorldOriginFromScenePlacement()
    }

    /** update transform from origin manually and update matrix */
    if (worldOriginPinpointAnchor.parent === Engine.instance.currentWorld.scene) {
      const origin = getComponent(world.originEntity, TransformComponent)
      worldOriginPinpointAnchor.position.copy(origin.position)
      worldOriginPinpointAnchor.quaternion.copy(origin.rotation)
      worldOriginPinpointAnchor.scale.copy(origin.scale)
      worldOriginPinpointAnchor.updateMatrixWorld(true)
    }
  }

  return { execute, cleanup }
}
