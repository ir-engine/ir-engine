export type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar'

export type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded'

export type XREnvironmentBlendMode = 'opaque' | 'additive' | 'alpha-blend'

export type XRVisibilityState = 'visible' | 'visible-blurred' | 'hidden'

export type XRHandedness = 'none' | 'left' | 'right'

export type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen'

export type XREye = 'none' | 'left' | 'right'

export type XREventType =
  | 'devicechange'
  | 'visibilitychange'
  | 'end'
  | 'inputsourceschange'
  | 'select'
  | 'selectstart'
  | 'selectend'
  | 'squeeze'
  | 'squeezestart'
  | 'squeezeend'
  | 'reset'

export type XRSpace = EventTarget

export interface XRRenderState {
  depthNear?: number
  depthFar?: number
  inlineVerticalFieldOfView?: number
  baseLayer?: XRWebGLLayer
}

export interface XRInputSource {
  handedness: XRHandedness
  targetRayMode: XRTargetRayMode
  targetRaySpace: XRSpace
  gripSpace: XRSpace | undefined
  gamepad: Gamepad | undefined
  profiles: string[]
}

export interface XRSessionInit {
  optionalFeatures?: string[]
  requiredFeatures?: string[]
}

export interface XRSession {
  addEventListener: any
  removeEventListener: any
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>
  updateRenderState(XRRenderStateInit: XRRenderState): Promise<void>
  requestAnimationFrame: any
  end(): Promise<void>
  renderState: XRRenderState
  inputSources: XRInputSource[]

  // hit test
  requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>
  requestHitTestSourceForTransientInput(
    options: XRTransientInputHitTestOptionsInit
  ): Promise<XRTransientInputHitTestSource>

  // legacy AR hit test
  requestHitTest(ray: XRRay, referenceSpace: XRReferenceSpace): Promise<XRHitResult[]>

  // legacy plane detection
  updateWorldTrackingState(options: { planeDetectionState?: { enabled: boolean } }): void
}

export interface XRReferenceSpace extends XRSpace {
  getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace
  onreset: any
}

export type XRPlaneSet = Set<XRPlane>
export type XRAnchorSet = Set<XRAnchor>

export interface XRFrame {
  session: XRSession
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | undefined
  getPose(space: XRSpace, baseSpace: XRSpace): XRPose | undefined

  // AR
  getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[]
  getHitTestResultsForTransientInput(hitTestSource: XRTransientInputHitTestSource): XRTransientInputHitTestResult[]
  // Anchors
  trackedAnchors?: XRAnchorSet
  createAnchor(pose: XRRigidTransform, space: XRSpace): Promise<XRAnchor>
  // Planes
  worldInformation: {
    detectedPlanes?: XRPlaneSet
  }
}

export interface XRViewerPose extends XRPose {
  views: XRView[]
}

export interface XRPose {
  transform: XRRigidTransform
  emulatedPosition: boolean
}

export interface XRWebGLLayerOptions {
  antialias?: boolean
  depth?: boolean
  stencil?: boolean
  alpha?: boolean
  multiview?: boolean
  framebufferScaleFactor?: number
}

export interface XRWebGLLayer {
  framebuffer: WebGLFramebuffer
  framebufferWidth: number
  framebufferHeight: number
  getViewport: any
}

export declare class XRRigidTransform {
  constructor(matrix: Float32Array | DOMPointInit, direction?: DOMPointInit)
  position: DOMPointReadOnly
  orientation: DOMPointReadOnly
  matrix: Float32Array
  inverse: XRRigidTransform
}

export interface XRView {
  eye: XREye
  projectionMatrix: Float32Array
  transform: XRRigidTransform
}

export interface XRInputSourceChangeEvent {
  session: XRSession
  removed: XRInputSource[]
  added: XRInputSource[]
}

export interface XRInputSourceEvent extends Event {
  readonly frame: XRFrame
  readonly inputSource: XRInputSource
}

// Experimental(er) features
export declare class XRRay {
  constructor(transformOrOrigin: XRRigidTransform | DOMPointInit, direction?: DOMPointInit)
  origin: DOMPointReadOnly
  direction: DOMPointReadOnly
  matrix: Float32Array
}

export declare enum XRHitTestTrackableType {
  'point',
  'plane'
}

export interface XRHitResult {
  hitMatrix: Float32Array
}

export interface XRTransientInputHitTestResult {
  readonly inputSource: XRInputSource
  readonly results: XRHitTestResult[]
}

export interface XRHitTestResult {
  getPose(baseSpace: XRSpace): XRPose | undefined
  // When anchor system is enabled
  createAnchor?(pose: XRRigidTransform): Promise<XRAnchor>
}

export interface XRHitTestSource {
  cancel(): void
}

export interface XRTransientInputHitTestSource {
  cancel(): void
}

export interface XRHitTestOptionsInit {
  space: XRSpace
  entityTypes?: XRHitTestTrackableType[]
  offsetRay?: XRRay
}

export interface XRTransientInputHitTestOptionsInit {
  profile: string
  entityTypes?: XRHitTestTrackableType[]
  offsetRay?: XRRay
}

export interface XRAnchor {
  anchorSpace: XRSpace
  delete(): void
}

export interface XRPlane {
  orientation: 'Horizontal' | 'Vertical'
  planeSpace: XRSpace
  polygon: DOMPointReadOnly[]
  lastChangedTime: number
}
