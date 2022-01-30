import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'

export function LoadingCircle() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        textAlign: 'center',
        paddingTop: 'calc(50vh - 7px)'
      }}
    >
      <CircularProgress />
    </div>
  )
}
