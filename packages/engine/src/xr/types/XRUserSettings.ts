/**
 * @author HydraFire <github.com/HydraFire>
 */
export enum XR_FOLLOW_MODE {
  HEAD,
  CONTROLLER
}

export enum XR_ROTATION_MODE {
  ANGLED,
  SMOOTH
}

export const XRUserSettings = {
  invertRotationAndMoveSticks: true,
  moving: XR_FOLLOW_MODE.CONTROLLER,
  rotation: XR_ROTATION_MODE.ANGLED,
  rotationSmoothSpeed: 0.1, // 0.1, 0.3, 0.5, 0.8, 1 - only for Smooth
  rotationAngle: 30, // 15, 30, 45, 60 - only for Angler
  rotationInvertAxes: true
}
