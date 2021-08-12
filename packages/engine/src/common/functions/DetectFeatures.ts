export const isTouchAvailable =
  'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0

export const isShareAvailable = navigator.share != null

export const isImmersiveVRSupported = (async () => {
  ;(navigator as any).xr.isSessionSupported('immersive-vr').then((isSupported) => {
    return isSupported
  })
})()
