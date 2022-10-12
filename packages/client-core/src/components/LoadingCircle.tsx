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
      {props.message}
    </div>
  )
}
