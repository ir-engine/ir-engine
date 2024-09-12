export const isSupportedBrowser = () => {
  const userAgent = navigator.userAgent as any
  const winNav = window.navigator as any

  const isGoogleChrome =
    /Chrome/.test(userAgent) && typeof winNav.userAgentData !== 'undefined'
      ? winNav.userAgentData.brands[2].brand === 'Google Chrome'
      : winNav.vendor === 'Google Inc.'
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) && /Apple Computer/.test(navigator.vendor)

  if (!isGoogleChrome && !isSafari) {
    return false
  }

  return true
}
