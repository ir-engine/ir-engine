import React from 'react'

/**
 * @param props
 * @returns
 */

export const PreviewUnavailable = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--text)'
      }}
    >
      Preview is Unavailable
    </div>
  )
}
