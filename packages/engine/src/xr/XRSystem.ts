import { AxesHelper, Matrix4, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { V_010 } from '../common/constants/MathConstants'
import { EngineActions } from '../ecs/classes/EngineState'
import { Entity } from '../ecs/classes/Entity'
import { createEntity } from '../ecs/functions/EntityFunctions'
import { BaseInput } from '../input/enums/BaseInput'
import { GamepadAxis } from '../input/enums/InputEnums'
import { addObjectToGroup } from '../scene/components/GroupComponent'
import { NameComponent } from '../scene/components/NameComponent'
import { VisibleComponent } from '../scene/components/VisibleComponent'
import { setComputedTransformComponent } from '../transform/components/ComputedTransformComponent'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../transform/components/TransformComponent'
import { updateEntityTransform } from '../transform/systems/TransformSystem'
import { BinaryValue } from './../common/enums/BinaryValue'
import { LifecycleValue } from './../common/enums/LifecycleValue'
import { Engine } from './../ecs/classes/Engine'
import { World } from './../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  removeQuery,
  setComponent
} from './../ecs/functions/ComponentFunctions'
import { InputType } from './../input/enums/InputType'
import { GamepadMapping } from './../input/functions/GamepadInput'
import { EngineRenderer } from './../renderer/WebGLRendererSystem'
import { XRAction } from './XRAction'
import { XRHitTestComponent, XRInputSourceComponent } from './XRComponents'
import { updateXRControllerAnimations } from './XRControllerFunctions'
import { setupLocalXRInputs } from './XRFunctions'
import { endXRSession, requestXRSession, xrSessionChanged } from './XRSessionFunctions'
import { getControlMode, XRState } from './XRState'

const updateXRCameraTransform = (camera: PerspectiveCamera, originMatrix: Matrix4) => {
  camera.matrixWorld.multiplyMatrices(originMatrix, camera.matrix)
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
}

export const updateXRInput = (world = Engine.instance.currentWorld) => {
  const xrManager = EngineRenderer.instance.xrManager
  const camera = Engine.instance.currentWorld.camera as PerspectiveCamera

  /*
   * Updates the XR camera to the camera position, including updating it's world matrix
   */
  xrManager.updateCamera(camera)

  /*
   * We want to position the camera relative to the xr origin
   */
  const cameraLocalTransform = getComponent(world.cameraEntity, LocalTransformComponent)
  cameraLocalTransform.matrix.copy(camera.matrixWorld)
  cameraLocalTransform.position.copy(camera.position)
  cameraLocalTransform.rotation.copy(camera.quaternion)
  cameraLocalTransform.scale.copy(camera.scale)

  /*
   * xr cameras also have to have their world transforms updated relative to the origin, as these are used for actual rendering
   */
  const originTransform = getComponent(world.xrOriginEntity, TransformComponent)
  const cameraXR = EngineRenderer.instance.xrManager.getCamera()
  updateXRCameraTransform(cameraXR, originTransform.matrix)
  for (const camera of cameraXR.cameras) updateXRCameraTransform(camera, originTransform.matrix)

  if (getControlMode() === 'attached') {
    const xrInputSourceComponent = getComponent(Engine.instance.currentWorld.localClientEntity, XRInputSourceComponent)
    const head = xrInputSourceComponent.head
    head.quaternion.copy(camera.quaternion)
    head.position.copy(camera.position)

    head.updateMatrix()
    head.updateMatrixWorld(true)
  }

  // TODO: uncomment the following when three.js fixes WebXRManager
  // const xrFrame = Engine.instance.xrFrame
  // for (let i = 0; i < xrManager.controllers.length; i++) {
  //   const inputSource = xrManager.controllerInputSources[i]
  //   const controller = xrManager.controllers[i]
  //   if (inputSource !== null && controller !== undefined) {
  //     controller.update(inputSource, xrFrame, xrManager.getReferenceSpace())
  //   }
  // }
}

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

/**
 * System for XR session and input handling
 */
export default async function XRSystem(world: World) {
  const xrState = getState(XRState)

  const updateSessionSupportForMode = (mode: XRSessionMode) => {
    navigator.xr?.isSessionSupported(mode).then((supported) => xrState.supportedSessionModes[mode].set(supported))
  }

  const updateSessionSupport = () => {
    updateSessionSupportForMode('inline')
    updateSessionSupportForMode('immersive-ar')
    updateSessionSupportForMode('immersive-vr')
  }

  navigator.xr?.addEventListener('devicechange', updateSessionSupport)
  updateSessionSupport()
  setupLocalXRInputs()

  const viewerHitTestEntity = createEntity()
  setComponent(viewerHitTestEntity, NameComponent, { name: 'xr-viewer-hit-test' })
  setLocalTransformComponent(viewerHitTestEntity, world.xrOriginEntity)
  setComponent(viewerHitTestEntity, VisibleComponent, true)
  setComponent(viewerHitTestEntity, XRHitTestComponent, null)

  const smoothedViewerHitResultPose = {
    position: new Vector3(),
    rotation: new Quaternion()
  }
  const smoothedSceneScale = new Vector3()

  // addObjectToGroup(viewerHitTestEntity, new AxesHelper(10))

  xrState.viewerHitTestEntity.set(viewerHitTestEntity)

  const xrControllerQuery = defineQuery([XRInputSourceComponent])
  const xrHitTestQuery = defineQuery([XRHitTestComponent, TransformComponent])
  const xrRequestSessionQueue = createActionQueue(XRAction.requestSession.matches)
  const xrEndSessionQueue = createActionQueue(XRAction.endSession.matches)
  const xrSessionChangedQueue = createActionQueue(XRAction.sessionChanged.matches)
  const buttonClickedQueue = createActionQueue(EngineActions.buttonClicked.matches)

  const _vecPosition = new Vector3()
  const _vecScale = new Vector3()
  const _quat = new Quaternion()

  const execute = () => {
    const xrRequestSessionAction = xrRequestSessionQueue().pop()
    const xrEndSessionAction = xrEndSessionQueue().pop()
    if (xrRequestSessionAction) requestXRSession(xrRequestSessionAction)
    if (xrEndSessionAction) endXRSession()

    for (const action of xrSessionChangedQueue()) xrSessionChanged(action)

    if (EngineRenderer.instance.xrManager) {
      if (!!Engine.instance.xrFrame?.getHitTestResults && xrState.viewerHitTestSource.value) {
        for (const entity of xrHitTestQuery()) updateHitTest(entity)
      }

      updateEntityTransform(viewerHitTestEntity)
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

      // for (const action o  f buttonClickedQueue()) {
      //   if (action.clicked && action.button === BaseInput.PRIMARY) {

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

      //   }
      // }

      updateXRInput(world)

      // Assume world.camera.layers is source of truth for all xr cameras
      const camera = Engine.instance.currentWorld.camera as PerspectiveCamera
      const xrCamera = EngineRenderer.instance.xrManager.getCamera()
      xrCamera.layers.mask = camera.layers.mask
      for (const c of xrCamera.cameras) c.layers.mask = camera.layers.mask

      const session = EngineRenderer.instance.xrManager!.getSession()
      if (session?.inputSources) for (const source of session.inputSources) updateGamepadInput(source)
    }

    //XR Controller mesh animation update
    for (const entity of xrControllerQuery()) updateXRControllerAnimations(getComponent(entity, XRInputSourceComponent))
  }

  const cleanup = async () => {
    navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    removeQuery(world, xrControllerQuery)
    removeQuery(world, xrHitTestQuery)
    removeActionQueue(xrRequestSessionQueue)
    removeActionQueue(xrEndSessionQueue)
    removeActionQueue(xrSessionChangedQueue)
  }

  return {
    execute,
    cleanup,
    subsystems: [() => import('./XRDepthOcclusion'), () => import('./8thwall/XR8')]
  }
}

export function updateGamepadInput(source: XRInputSource) {
  if (source.gamepad?.mapping === 'xr-standard') {
    const mapping = GamepadMapping['xr-standard'][source.handedness]

    source.gamepad.buttons.forEach((button, index) => {
      // TODO : support button.touched and button.value
      const prev = Engine.instance.currentWorld.prevInputState.has(mapping[index])
      if (!prev && !button.pressed) return
      Engine.instance.currentWorld.inputState.set(mapping[index], {
        type: InputType.BUTTON,
        value: [button.pressed ? BinaryValue.ON : BinaryValue.OFF],
        lifecycleState: button.pressed ? LifecycleValue.Started : LifecycleValue.Ended
      })
    })

    // TODO: we shouldn't be modifying input data here, deadzone should be handled elsewhere
    const inputData = [...source.gamepad.axes]
    for (let i = 0; i < inputData.length; i++) {
      if (Math.abs(inputData[i]) < 0.05) inputData[i] = 0
    }

    // NOTE: we are inverting input here, as the avatar model is flipped 180 degrees. when that is solved, uninvert these gamepad inputs
    if (inputData.length >= 2) {
      const Touchpad = source.handedness === 'left' ? GamepadAxis.LTouchpad : GamepadAxis.RTouchpad

      Engine.instance.currentWorld.inputState.set(Touchpad, {
        type: InputType.TWODIM,
        value: [inputData[0], inputData[1]],
        lifecycleState: LifecycleValue.Started // TODO
      })
    }

    if (inputData.length >= 4) {
      const Thumbstick = source.handedness === 'left' ? GamepadAxis.LThumbstick : GamepadAxis.RThumbstick
      Engine.instance.currentWorld.inputState.set(Thumbstick, {
        type: InputType.TWODIM,
        value: [inputData[2], inputData[3]],
        lifecycleState: LifecycleValue.Started // TODO
      })
    }
  }
}
/*


const worldOriginTransform = XRE_getComponent(2, ComponentMap.get('TransformComponent'))
worldOriginTransform.scale.setScalar(10)


*/
