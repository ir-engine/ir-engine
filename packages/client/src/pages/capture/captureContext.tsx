import React, { createContext, useMemo } from 'react'

export interface CaptureContextProps {
  hello: string
}

export const CaptureContext = createContext<CaptureContextProps>({
  hello: ''
})

/**
 * Theme Context Provider.
 *
 * @param value any
 * @param children ReactNode
 * @returns ReactNode
 */
export const CaptureContextProvider = ({ value, children }: { value?: any; children: React.ReactNode }) => {
  /**
   * Current context value
   */
  const val = useMemo(
    () => ({
      hello: 'world'
    }),
    []
  )

  return <CaptureContext.Provider value={val}>{children}</CaptureContext.Provider>
}
