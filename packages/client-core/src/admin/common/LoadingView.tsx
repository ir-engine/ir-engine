import React from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { SxProps, Theme } from '@mui/material/styles'
import { Variant } from '@mui/material/styles/createTypography'
import Typography from '@mui/material/Typography'

interface Props {
  className?: string
  title?: string
  variant?: Variant
  titleColor?: string
  sx?: SxProps<Theme>
  fullHeight?: boolean
}

const LoadingView = ({ className, title, variant, titleColor, sx, fullHeight = true }: Props) => {
  if (!variant) {
    variant = 'h6'
  }

  return (
    <Box
      className={className}
      sx={{
        height: fullHeight ? '100%' : '100px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        ...sx
      }}
    >
      <CircularProgress size={40} sx={{ marginBottom: 1 }} />
      {title && (
        <Typography variant={variant} sx={{ color: titleColor }}>
          {title}
        </Typography>
      )}
    </Box>
  )
}

export default LoadingView
