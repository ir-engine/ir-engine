import { XRFrame, XRReferenceSpace } from "../types/WebXR";
export declare const startVR: (onStarted?: Function, onEnded?: Function) => any;
export declare const initVR: (onVRSupportRequested?: any) => void;
export declare function getInputSources({ inputSources }: {
    inputSources?: any[];
}, frame: XRFrame, refSpace: XRReferenceSpace): {
    targetRayPose: import("../types/WebXR").XRPose;
    targetRayMode: "gaze" | "tracked-pointer" | "screen";
    gripPose: import("../types/WebXR").XRPose;
    handedness: "none" | "left" | "right";
    gamepad: Gamepad;
}[];
