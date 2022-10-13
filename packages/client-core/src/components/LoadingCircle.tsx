import React from 'react'

import CircularProgress from '@mui/material/CircularProgress'

type Props = {
  message?: string
}

export function LoadingCircle(props: Props) {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        textAlign: 'center',
        paddingTop: 'calc(50vh - 7px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <CircularProgress />
      <div
        style={{
          // default values will be overridden by theme
          fontFamily: 'Lato',
          fontSize: '12px',
          color: '#585858',
          padding: '16px'
        }}
      >
        {props.message}
      </div>
    </div>
  )
}
