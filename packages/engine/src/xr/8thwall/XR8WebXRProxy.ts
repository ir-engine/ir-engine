/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { EventDispatcher, Matrix4, Quaternion, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { V_111 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { XRState } from '../XRState'
import { XR8 } from './XR8'

export class XRPose {
  readonly transform: XRRigidTransform
  constructor(transform: XRRigidTransform) {
    this.transform = transform
  }
}

export class XRView {
  readonly eye: 'left' | 'right' = 'left'
  readonly projectionMatrix: number[]
  readonly transform: XRRigidTransform

  constructor(transform: XRRigidTransform) {
    this.transform = transform
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    this.projectionMatrix = camera.projectionMatrix.toArray()
  }
}

export class XRViewerPose extends XRPose {
  readonly views: XRView[] = []

  constructor(transform: XRRigidTransform) {
    super(transform)
    this.views.push(new XRView(transform))
  }
}

export class XRHitTestResultProxy {
  _mat4: Matrix4
  constructor(position: Vector3, rotation: Quaternion) {
    this._mat4 = new Matrix4().compose(position, rotation, V_111)
  }

  getPose(baseSpace: XRSpace) {
    const _pos = new Vector3()
    const _rot = new Quaternion()
    _mat4.decompose(_pos, _rot, _scale)
    return (Engine.instance.xrFrame! as any as XRFrameProxy).getPose(baseSpace, new XRSpace(_pos, _rot))
  }

  /** @todo */
  createAnchor = undefined
}

export class XRSpace {
  _position = new Vector3()
  _rotation = new Quaternion()
  _matrix = new Matrix4()

  constructor(position?: Vector3, rotation?: Quaternion) {
    if (position) this._position.copy(position)
    if (rotation) this._rotation.copy(rotation)
    this._matrix.compose(this._position, this._rotation, new Vector3(1, 1, 1))
  }
}

export class XRReferenceSpace extends XRSpace {
  getOffsetReferenceSpace(originOffset: XRRigidTransform) {
    const offsetSpace = new XRReferenceSpace(this._position, this._rotation)
    offsetSpace._matrix.multiplyMatrices(this._matrix, originOffset._matrix)
    offsetSpace._matrix.decompose(offsetSpace._position, offsetSpace._rotation, _scale)
    return offsetSpace
  }
  onreset = undefined

  private _listeners = {}

  addEventListener(eventName: string | number, listener: Function) {
    const listeners = this._listeners
    if (listeners[eventName] === undefined) {
      listeners[eventName] = []
    }

    if (listeners[eventName].indexOf(listener) === -1) {
      listeners[eventName].push(listener)
    }
  }

  removeEventListener(eventName: string | number, listener: Function): void {
    const listenerArray = this._listeners[eventName]
    if (listenerArray !== undefined) {
      const index = listenerArray.indexOf(listener)
      if (index !== -1) {
        listenerArray.splice(index, 1)
      }
    }
  }

  protected dispatchEvent(event: { type: string; [attachment: string]: any }, ...args: any): void {
    const listenerArray = this._listeners[event.type]
    if (listenerArray !== undefined) {
      const array = listenerArray.slice(0)

      for (let i = 0; i < array.length; i++) {
        array[i].call(this, event, ...args)
      }
    }
  }
}

export class XRRigidTransform {
  position = new Vector3()
  orientation = new Quaternion()
  _matrix = new Matrix4()

  constructor(position?: Vector3, orientation?: Quaternion) {
    if (position) this.position.copy(position)
    if (orientation) this.orientation.copy(orientation)
    this._matrix.compose(this.position, this.orientation, V_111)
  }

  get matrix() {
    return this._matrix.toArray()
  }

  get inverse() {
    const inverse = this._matrix.clone().invert()
    const pos = new Vector3()
    const rot = new Quaternion()
    inverse.decompose(pos, rot, new Vector3())
    return new XRRigidTransform(pos, rot)
  }
}

export class XRHitTestSource {
  cancel() {}
}

export class XRSessionProxy extends EventDispatcher {
  readonly inputSources: XRInputSource[]
  readonly interactionMode: 'screen-space' | 'world-space' = 'screen-space'
  readonly domOverlayState: XRDOMOverlayState = { type: 'screen' }

  constructor(inputSources: XRInputSource[]) {
    super()
    this.inputSources = inputSources
  }

  async requestReferenceSpace(type: 'local-floor' | 'viewer') {
    const space = new XRReferenceSpace()
    return space
  }

  async requestHitTestSource(args: { space: XRReferenceSpace }) {
    const source = new XRHitTestSource()
    return source as XRHitTestSource
  }

  updateRenderState() {
    // intentional noop
  }
}

const _mat4 = new Matrix4()
const _pos = new Vector3()
const _rot = new Quaternion()
const _scale = new Vector3()

/**
 * currently, the hit test proxy only supports viewer space
 */
export class XRFrameProxy {
  getHitTestResults(source: XRHitTestSource) {
    const hits = XR8.XrController.hitTest(0.5, 0.5, ['FEATURE_POINT'])
    return hits.map(({ position, rotation }) => new XRHitTestResultProxy(position as Vector3, rotation as Quaternion))
  }

  get session() {
    return getState(XRState).session
  }

  getPose(space: XRSpace, baseSpace: XRSpace) {
    _mat4.copy(baseSpace._matrix).invert().multiply(space._matrix)
    _mat4.decompose(_pos, _rot, _scale)
    return new XRPose(new XRRigidTransform(_pos, _rot))
  }

  getViewerPose(space: XRReferenceSpace) {
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    return new XRViewerPose(new XRRigidTransform(camera.position, camera.quaternion))
  }
}
