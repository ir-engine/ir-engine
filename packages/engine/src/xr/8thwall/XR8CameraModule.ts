/**
 * Orients the camera canvas according to 8th wall's internal orientation and the window
 * @param cameraCanvas
 * @returns
 */
export const XR8CameraModule = (cameraCanvas: HTMLCanvasElement) => {
  const orientCameraFeed = function (orientation: number) {
    /** orientation can take a frame or two to complete, so wait until it matches what 8th wall expects */
    const needsUpdate =
      ((orientation === 0 || orientation === 180) && window.innerWidth > window.innerHeight) ||
      ((orientation === 90 || orientation === -90) && window.innerHeight > window.innerWidth)
    if (needsUpdate) {
      window.requestAnimationFrame(function () {
        return orientCameraFeed(orientation)
      })
    } else {
      cameraCanvas.width = window.innerWidth
      cameraCanvas.height = window.innerHeight
    }
  }

  return {
    name: 'fullwindowcanvas',
    onAttach: ({ canvas, orientation }) => {
      orientCameraFeed(orientation)
    },
    onDeviceOrientationChange: ({ orientation }) => {
      orientCameraFeed(orientation)
    }
  }
}
