/**
 * On 'xr-standard' mapping, get thumbstick input [2,3], fallback to thumbpad input [0,1]
 * On 'standard' mapping, get thumbstick input [0,1]
 */
export function getThumbstickOrThumbpadAxes(inputSource: XRInputSource, handedness: XRHandedness, deadZone = 0.05) {
  const gamepad = inputSource.gamepad
  const axes = gamepad!.axes
  const axesIndex = inputSource.gamepad?.mapping === 'xr-standard' || handedness === 'right' ? 2 : 0
  const xAxis = Math.abs(axes[axesIndex]) > deadZone ? axes[axesIndex] : 0
  const zAxis = Math.abs(axes[axesIndex + 1]) > deadZone ? axes[axesIndex + 1] : 0
  return [xAxis, zAxis] as [number, number]
}
