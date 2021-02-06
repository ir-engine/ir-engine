export declare type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
export declare type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';
export declare type XREnvironmentBlendMode = 'opaque' | 'additive' | 'alpha-blend';
export declare type XRVisibilityState = 'visible' | 'visible-blurred' | 'hidden';
export declare type XRHandedness = 'none' | 'left' | 'right';
export declare type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';
export declare type XREye = 'none' | 'left' | 'right';
export declare type XREventType = 'devicechange' | 'visibilitychange' | 'end' | 'inputsourceschange' | 'select' | 'selectstart' | 'selectend' | 'squeeze' | 'squeezestart' | 'squeezeend' | 'reset';
declare type XRSpace = EventTarget;
interface XRRenderState {
    depthNear?: number;
    depthFar?: number;
    inlineVerticalFieldOfView?: number;
    baseLayer?: XRWebGLLayer;
}
export interface XRInputSource {
    handedness: XRHandedness;
    targetRayMode: XRTargetRayMode;
    targetRaySpace: XRSpace;
    gripSpace: XRSpace | undefined;
    gamepad: Gamepad | undefined;
    profiles: string[];
}
export interface XRSession {
    addEventListener: any;
    removeEventListener: any;
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    updateRenderState(XRRenderStateInit: XRRenderState): Promise<void>;
    requestAnimationFrame: any;
    end(): Promise<void>;
    renderState: XRRenderState;
    inputSources: XRInputSource[];
    requestHitTestSource(options: XRHitTestOptionsInit): Promise<XRHitTestSource>;
    requestHitTestSourceForTransientInput(options: XRTransientInputHitTestOptionsInit): Promise<XRTransientInputHitTestSource>;
    requestHitTest(ray: XRRay, referenceSpace: XRReferenceSpace): Promise<XRHitResult[]>;
    updateWorldTrackingState(options: {
        planeDetectionState?: {
            enabled: boolean;
        };
    }): void;
}
export interface XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
    onreset: any;
}
declare type XRPlaneSet = Set<XRPlane>;
declare type XRAnchorSet = Set<XRAnchor>;
export interface XRFrame {
    session: XRSession;
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | undefined;
    getPose(space: XRSpace, baseSpace: XRSpace): XRPose | undefined;
    getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
    getHitTestResultsForTransientInput(hitTestSource: XRTransientInputHitTestSource): XRTransientInputHitTestResult[];
    trackedAnchors?: XRAnchorSet;
    createAnchor(pose: XRRigidTransform, space: XRSpace): Promise<XRAnchor>;
    worldInformation: {
        detectedPlanes?: XRPlaneSet;
    };
}
interface XRViewerPose extends XRPose {
    views: XRView[];
}
export interface XRPose {
    transform: XRRigidTransform;
    emulatedPosition: boolean;
}
export interface XRWebGLLayerOptions {
    antialias?: boolean;
    depth?: boolean;
    stencil?: boolean;
    alpha?: boolean;
    multiview?: boolean;
    framebufferScaleFactor?: number;
}
export interface XRWebGLLayer {
    framebuffer: WebGLFramebuffer;
    framebufferWidth: number;
    framebufferHeight: number;
    getViewport: any;
}
declare class XRRigidTransform {
    constructor(matrix: Float32Array | DOMPointInit, direction?: DOMPointInit);
    position: DOMPointReadOnly;
    orientation: DOMPointReadOnly;
    matrix: Float32Array;
    inverse: XRRigidTransform;
}
interface XRView {
    eye: XREye;
    projectionMatrix: Float32Array;
    transform: XRRigidTransform;
}
declare class XRRay {
    constructor(transformOrOrigin: XRRigidTransform | DOMPointInit, direction?: DOMPointInit);
    origin: DOMPointReadOnly;
    direction: DOMPointReadOnly;
    matrix: Float32Array;
}
declare enum XRHitTestTrackableType {
    'point',
    'plane'
}
interface XRHitResult {
    hitMatrix: Float32Array;
}
interface XRTransientInputHitTestResult {
    readonly inputSource: XRInputSource;
    readonly results: XRHitTestResult[];
}
interface XRHitTestResult {
    getPose(baseSpace: XRSpace): XRPose | undefined;
    createAnchor?(pose: XRRigidTransform): Promise<XRAnchor>;
}
interface XRHitTestSource {
    cancel(): void;
}
interface XRTransientInputHitTestSource {
    cancel(): void;
}
interface XRHitTestOptionsInit {
    space: XRSpace;
    entityTypes?: XRHitTestTrackableType[];
    offsetRay?: XRRay;
}
interface XRTransientInputHitTestOptionsInit {
    profile: string;
    entityTypes?: XRHitTestTrackableType[];
    offsetRay?: XRRay;
}
interface XRAnchor {
    anchorSpace: XRSpace;
    delete(): void;
}
interface XRPlane {
    orientation: 'Horizontal' | 'Vertical';
    planeSpace: XRSpace;
    polygon: DOMPointReadOnly[];
    lastChangedTime: number;
}
export {};
