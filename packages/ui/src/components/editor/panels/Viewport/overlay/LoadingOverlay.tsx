import { useHookstate } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'

interface LoadingOverlayProps {
  isLoading: boolean
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  const showSpinner = useHookstate<boolean>(false)

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isLoading) {
      timeout = setTimeout(() => showSpinner.set(true), 500) // show spinner after 500ms
    } else {
      showSpinner.set(false)
    }
    return () => clearTimeout(timeout)
  }, [isLoading])

  if (!isLoading) return null

  return (
    // immediately dim viewport
    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      {showSpinner.value && (
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      )}
    </div>
  )
}

export default LoadingOverlay
