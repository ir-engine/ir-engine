import React from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Variant } from '@mui/material/styles/createTypography'
import Typography from '@mui/material/Typography'

interface Props {
  title: string
  variant?: Variant
}

const LoadingView = ({ title, variant }: Props) => {
  if (!variant) {
    variant = 'h6'
  }

  const content = (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CircularProgress size={40} sx={{ marginBottom: 1 }} />
      <Typography variant={variant}>{title}</Typography>
    </Box>
  )

  return content
}

export default LoadingView
