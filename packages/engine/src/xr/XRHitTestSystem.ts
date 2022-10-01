import {
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  RingGeometry,
  Shader,
  ShaderMaterial,
  ShadowMaterial,
  Vector2,
  Vector3
} from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { V_010 } from '../common/constants/MathConstants'
import { addOBCPlugin, removeOBCPlugin } from '../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery, setComponent } from '../ecs/functions/ComponentFunctions'
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
import { DepthCanvasTexture } from './DepthCanvasTexture'
import { DepthDataTexture } from './DepthDataTexture'
import { XRAction } from './XRAction'
import { XRHitTestComponent } from './XRComponents'
import { XRState } from './XRState'
import { XRCPUDepthInformation } from './XRTypes'

const _vecPosition = new Vector3()
const _vecScale = new Vector3()
const _quat = new Quaternion()

const smoothedViewerHitResultPose = {
  position: new Vector3(),
  rotation: new Quaternion()
}
const smoothedSceneScale = new Vector3()

export const updateHitTest = (entity: Entity) => {
  const xrState = getState(XRState)
  const xrFrame = Engine.instance.xrFrame

  const hitTestComponent = getComponent(entity, XRHitTestComponent)
  const transform = getComponent(entity, LocalTransformComponent)
  const hitTestResults = xrFrame.getHitTestResults(xrState.viewerHitTestSource.value!)

  if (hitTestResults.length) {
    const hit = hitTestResults[0]
    const hitData = hit.getPose(xrState.originReferenceSpace.value!)!
    transform.matrix.fromArray(hitData.transform.matrix)
    transform.matrix.decompose(transform.position, transform.rotation, transform.scale)
    hitTestComponent.hasHit.set(true)
  } else {
    hitTestComponent.hasHit.set(false)
  }
}

export const updatePlacementMode = (world = Engine.instance.currentWorld) => {
  const xrState = getState(XRState)

  const viewerHitTestEntity = xrState.viewerHitTestEntity.value

  updateEntityTransform(viewerHitTestEntity)

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
  const worldOriginTransform = getComponent(world.xrOriginEntity, TransformComponent)
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

/**
 * Updates materials with XR depth map uniforms
 * @param world
 * @returns
 */
export default async function XRHitTestSystem(world: World) {
  const xrState = getState(XRState)

  const viewerHitTestEntity = createEntity()
  setComponent(viewerHitTestEntity, NameComponent, { name: 'xr-viewer-hit-test' })
  setLocalTransformComponent(viewerHitTestEntity, world.xrOriginEntity)
  setComponent(viewerHitTestEntity, VisibleComponent, true)
  setComponent(viewerHitTestEntity, XRHitTestComponent, null)

  xrState.viewerHitTestEntity.set(viewerHitTestEntity)

  // addObjectToGroup(viewerHitTestEntity, new AxesHelper(10))

  const xrViewerHitTestMesh = new Mesh(new RingGeometry(0.08, 0.1, 16), new MeshBasicMaterial({ color: 'white' }))
  xrViewerHitTestMesh.geometry.rotateX(-Math.PI / 2)

  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])

  const execute = () => {
    if (!EngineRenderer.instance.xrSession) return

    if (!!Engine.instance.xrFrame?.getHitTestResults && xrState.viewerHitTestSource.value) {
      for (const entity of xrHitTestQuery()) updateHitTest(entity)
    }

    if (xrState.scenePlacementMode.value) {
      updatePlacementMode(world)
    }

    /**
     * Hit Test Helper
     */
    for (const entity of xrHitTestQuery()) {
      const hasHit = getComponent(entity, XRHitTestComponent).hasHit.value
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
  }

  return { execute, cleanup }
}
