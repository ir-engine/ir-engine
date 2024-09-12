import { useEffect, useState } from 'react'

export const useBrowserCheck = () => {
  const [unsupported, setUnsupported] = useState(false)

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent

      const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor)
      const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent) && /Apple Computer/.test(navigator.vendor)

      if (!isChrome && !isSafari) {
        setUnsupported(true)
      }
    }

    detectBrowser()
  }, [])

  return unsupported
}
