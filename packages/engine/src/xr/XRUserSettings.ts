export enum XR_FOLLOW_MODE {
  HEAD = 'HEAD',
  CONTROLLER = 'CONTROLLER'
}

export enum XR_ROTATION_MODE {
  ANGLED = 'ANGLED',
  SMOOTH = 'SMOOTH'
}

export const XRUserSettings = {
  invertRotationAndMoveSticks: true,
  moving: XR_FOLLOW_MODE.CONTROLLER,
  rotation: XR_ROTATION_MODE.ANGLED,
  rotationSmoothSpeed: 0.1, // 0.1, 0.3, 0.5, 0.8, 1 - only for Smooth
  rotationAngle: 30, // 15, 30, 45, 60 - only for Angler
  rotationInvertAxes: true
}
