// import XRInputSource from './webxr-polyfill/api/XRInputSource';
import { mat4, quat, vec3 } from 'gl-matrix'

import XRTransientInputHitTestSource from '../webxr-emulator/api/XRTransientInputHitTestSource'
import { PRIVATE as XRSESSION_PRIVATE } from '../webxr-emulator/webxr-polyfill/api/XRSession'
import XRDevice from '../webxr-emulator/webxr-polyfill/devices/XRDevice'
import { XR8 } from './XR8'

// import ARScene from './ARScene';

const DEFAULT_MODES = ['immersive-ar']

// @TODO: This value should shared with panel.js?
const DEFAULT_HEADSET_POSITION = [0, 1.6, 0] as any

// 10000 is for AR Scene
const DIV_Z_INDEX = '9999'
const DOM_OVERLAY_Z_INDEX = '10001'

// For AR
const DEFAULT_RESOLUTION = { width: 1024, height: 2048 }
const DEFAULT_DEVICE_SIZE = { width: 0.05, height: 0.1, depth: 0.005 }

export default class XR8Device extends XRDevice {
  sessions: Map<any, any>
  features: any
  position: vec3
  quaternion: quat
  scale: vec3
  matrix: mat4
  projectionMatrix: mat4
  viewMatrix: mat4
  div: HTMLDivElement
  originalCanvasParams: { parentElement: any; width: number; height: number }
  domOverlayRoot: any
  resolution: any
  deviceSize: any
  touched: boolean
  isPointerAndTabledCloseEnough: boolean
  hitTestSources: any[]
  hitTestResults: Map<any, any>
  hitTestSourcesForTransientInput: any[]
  hitTestResultsForTransientInput: Map<any, any>

  // @TODO: write config parameter comment

  constructor(global) {
    super(global)

    this.sessions = new Map()

    // headset
    this.position = vec3.copy(vec3.create(), DEFAULT_HEADSET_POSITION)
    this.quaternion = quat.create()
    this.scale = vec3.fromValues(1, 1, 1)
    this.matrix = mat4.create()
    this.projectionMatrix = mat4.create()
    this.viewMatrix = mat4.create()

    // @TODO: Edit this comment
    // For case where baseLayer's canvas isn't in document.body

    this.div = document.createElement('div')
    this.div.style.position = 'absolute'
    this.div.style.width = '100%'
    this.div.style.height = '100%'
    this.div.style.top = '0'
    this.div.style.left = '0'
    this.div.style.zIndex = DIV_Z_INDEX // To override window overall
    this.originalCanvasParams = {
      parentElement: null,
      width: 0,
      height: 0
    }

    // For DOM overlay API

    this.domOverlayRoot = null

    // For AR

    this.resolution = DEFAULT_RESOLUTION
    this.deviceSize = DEFAULT_DEVICE_SIZE
    this.touched = false
    this.isPointerAndTabledCloseEnough = false // UGH... @TODO: Rename

    this.hitTestSources = []
    this.hitTestResults = new Map()

    this.hitTestSourcesForTransientInput = []
    this.hitTestResultsForTransientInput = new Map()
  }

  onBaseLayerSet(sessionId, layer) {
    const session = this.sessions.get(sessionId)

    // Remove old canvas first
    // if (session.immersive && session.baseLayer) {
    //   this._removeBaseLayerCanvasFromDiv(sessionId);
    // }

    session.baseLayer = layer
    if (session.immersive && session.baseLayer) {
      // this._appendBaseLayerCanvasToDiv(sessionId);
      // if (session.ar) {
      //   const canvas = session.baseLayer.context.canvas;
      //   canvas.width = this.resolution.width;
      //   canvas.height = this.resolution.height;
      // }
    }
  }

  isSessionSupported(mode) {
    return mode === 'immersive-ar'
  }

  isFeatureSupported(featureDescriptor) {
    return true // todo
    if (this.features.includes(featureDescriptor)) {
      return true
    }
    switch (featureDescriptor) {
      case 'viewer':
        return true
      case 'local':
        return true
      case 'local-floor':
        return true
      case 'bounded-floor':
        return false
      case 'unbounded':
        return false
      case 'dom-overlay':
        return true
      default:
        return false // @TODO: Throw an error?
    }
  }

  async requestSession(mode, enabledFeatures) {
    if (!this.isSessionSupported(mode)) {
      return Promise.reject()
    }
    const immersive = mode === 'immersive-ar'
    const session = new Session(mode, enabledFeatures)
    this.sessions.set(session.id, session)
    if (immersive) {
      this.dispatchEvent('@@webxr-polyfill/vr-present-start', session.id)
      this._notifyEnterImmersive()
    }
    return Promise.resolve(session.id)
  }

  requestAnimationFrame(callback) {
    return this.global.requestAnimationFrame(callback)
  }

  cancelAnimationFrame(handle) {
    this.global.cancelAnimationFrame(handle)
  }

  // @ts-ignore
  onFrameStart(sessionId, renderState) {
    const session = this.sessions.get(sessionId)
    // console.log(session)
    const near = renderState.depthNear
    const far = renderState.depthFar

    const aspect = this.deviceSize.width / this.deviceSize.height
    mat4.perspective(this.projectionMatrix, Math.PI / 2, aspect, near, far)

    const three = XR8.Threejs.xrScene()
    console.log(three.camera.position, three.camera.quaternion)
    const position = three.camera.position.toArray()
    const orientation = three.camera.quaternion.toArray()

    // @todo - update this from 8thwall
    mat4.fromRotationTranslationScale(this.matrix, orientation, position, this.scale)
    mat4.invert(this.viewMatrix, this.matrix)

    // @TODO: Confirm if input events are only for immersive session
    // @TODO: If there are multiple immersive sessions, input events are fired only for the first session.
    //        Fix this issue (if multiple immersive sessions can be created).
    this._hitTest(sessionId, this.hitTestSources, this.hitTestResults)
    this._hitTest(sessionId, this.hitTestSourcesForTransientInput, this.hitTestResultsForTransientInput)
  }

  onFrameEnd(sessionId) {
    // We handle touch event on AR device as transient input for now.
    // If primary action happens on transient input
    // 1. First fire intputsourceschange event
    // 2. And then fire select start event
    // But in webxr-polyfill.js, inputsourceschange event is fired
    // after onFrameStart() by making an input source active.
    // So I need to postpone input select event until onFrameEnd() here.
    // Regarding select and select end events, they should be fired
    // before inputsourceschange event, so ok to be in onFrameStart().
    const session = this.sessions.get(sessionId)
    if (session.immersive) {
    }
  }

  async requestFrameOfReferenceTransform(type, options) {
    // @TODO: Add note
    const matrix = mat4.create()
    switch (type) {
      case 'viewer':
      case 'local':
        matrix[13] = -DEFAULT_HEADSET_POSITION[1]
        return matrix

      case 'local-floor':
        return matrix

      case 'bounded-floor':
      case 'unbound':
      default:
        // @TODO: Throw an error?
        return matrix
    }
  }

  endSession(sessionId) {
    const session = this.sessions.get(sessionId)
    if (session.immersive && session.baseLayer) {
      // this._removeBaseLayerCanvasFromDiv(sessionId);
      this.domOverlayRoot = null
      this.dispatchEvent('@@webxr-polyfill/vr-present-end', sessionId)
      this._notifyLeaveImmersive()
    }
    session.ended = true
  }

  doesSessionSupportReferenceSpace(sessionId, type) {
    const session = this.sessions.get(sessionId)
    if (session.ended) {
      return false
    }
    return session.enabledFeatures.has(type)
  }

  getViewport(sessionId, eye, layer, target) {
    const session = this.sessions.get(sessionId)
    const canvas = session.baseLayer.context.canvas
    const width = canvas.width
    const height = canvas.height
    target.x = 0
    target.y = 0
    target.width = width
    target.height = height
    return true
  }

  // @ts-ignore
  getProjectionMatrix() {
    return this.projectionMatrix
  }

  // @ts-ignore
  getBasePoseMatrix() {
    return this.matrix
  }

  // @ts-ignore
  getBaseViewMatrix() {
    return this.viewMatrix
  }

  getInputSources() {
    return []
  }

  // @ts-ignore
  getInputPose(inputSource, coordinateSystem, poseType) {
    throw new Error('getInputPose is not supported by XR8Device')
  }

  onWindowResize() {
    // @TODO: implement
  }

  // DOM Overlay API

  setDomOverlayRoot(root) {
    this.domOverlayRoot = root
  }

  // AR Hitting test

  addHitTestSource(source) {
    this.hitTestSources.push(source)
  }

  getHitTestResults(source) {
    return this.hitTestResults.get(source) || []
  }

  addHitTestSourceForTransientInput(source) {
    this.hitTestSourcesForTransientInput.push(source)
  }

  getHitTestResultsForTransientInput(source) {
    return this.hitTestResultsForTransientInput.get(source) || []
  }

  // Hit Test

  _hitTest(sessionId, hitTestSources, hitTestResults) {
    // Remove inactive sources first
    let activeHitTestSourceNum = 0
    for (let i = 0; i < hitTestSources.length; i++) {
      const source = hitTestSources[i]
      if (source._active) {
        hitTestSources[activeHitTestSourceNum++] = source
      }
    }
    hitTestSources.length = activeHitTestSourceNum

    // Do hit test next
    hitTestResults.clear()
    for (const source of hitTestSources) {
      if (sessionId !== source._session[XRSESSION_PRIVATE].id) {
        continue
      }

      // Gets base matrix depending on hit test source type
      let baseMatrix
      if (source instanceof XRTransientInputHitTestSource) {
        // if (!this.gamepadInputSources[0].active) {
        //   continue;
        // }
        // if (!source._profile.includes('touch')) {
        //   continue;
        // }
        // const gamepad = this.gamepads[0];
        // const matrix = mat4.identity(mat4.create());
        // matrix[12] = gamepad.axes[0];
        // matrix[13] = -gamepad.axes[1];
        // baseMatrix = mat4.multiply(matrix, this.matrix, matrix);
      } else {
        baseMatrix = source._space._baseMatrix
        if (!baseMatrix) {
          continue
        }
      }

      // Calculates origin and direction used for hit test in AR scene
      const offsetRay = source._offsetRay
      const origin = vec3.set(vec3.create(), offsetRay.origin.x, offsetRay.origin.y, offsetRay.origin.z)
      const direction = vec3.set(vec3.create(), offsetRay.direction.x, offsetRay.direction.y, offsetRay.direction.z)
      vec3.transformMat4(origin, origin, baseMatrix)
      vec3.transformQuat(direction, direction, mat4.getRotation(quat.create(), baseMatrix))

      // Do hit test in AR scene and stores the result matrices
      // const arHitTestResults = this.arScene.getHitTestResults(origin, direction);
      // const results = [];
      // for (const result of arHitTestResults) {
      //   const matrix = mat4.create();
      //   // @TODO: Save rotation
      //   matrix[12] = result.point.x;
      //   matrix[13] = result.point.y;
      //   matrix[14] = result.point.z;
      //   results.push(matrix);
      // }
      // hitTestResults.set(source, results);
    }
  }

  // Notify the update to panel

  _notifyPoseUpdate() {}

  // controllerIndex: 0 => Right, 1 => Left
  _notifyInputPoseUpdate(controllerIndex) {
    // const pose = this.gamepads[controllerIndex].pose;
    // const objectName = controllerIndex === 0 ? 'rightController' : 'leftController';
    // dispatchCustomEvent('device-input-pose', {
    //   position: pose.position,
    //   quaternion: pose.orientation,
    //   objectName: objectName
    // });
  }

  _notifyEnterImmersive() {
    // dispatchCustomEvent('device-enter-immersive', {});
  }

  _notifyLeaveImmersive() {
    // dispatchCustomEvent('device-leave-immersive', {});
  }

  // Send request to content-scripts

  _requestVirtualRoomAsset() {
    // dispatchCustomEvent('webxr-virtual-room-request', {});
  }
}

let SESSION_ID = 0
class Session {
  id: number
  mode: any
  immersive: boolean
  vr: boolean
  ar: boolean
  baseLayer: null
  inlineVerticalFieldOfView: number
  ended: boolean
  enabledFeatures: any
  constructor(mode, enabledFeatures) {
    this.mode = mode
    this.immersive = mode == 'immersive-vr' || mode == 'immersive-ar'
    this.vr = mode === 'immersive-vr'
    this.ar = mode === 'immersive-ar'
    this.id = ++SESSION_ID
    this.baseLayer = null
    this.inlineVerticalFieldOfView = Math.PI * 0.5
    this.ended = false
    this.enabledFeatures = enabledFeatures
  }
}
