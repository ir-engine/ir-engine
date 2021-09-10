export const isTouchAvailable =
  'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0

export const isShareAvailable = navigator.share != null

export const isImmersiveVRSupported = (async () => {
  if (!(navigator as any).xr) return false
  ;(navigator as any).xr.isSessionSupported('immersive-vr').then((isSupported) => {
    return isSupported
  })
})()
