import React from 'react'

import Box from '@etherealengine/ui/src/primitives/mui/Box'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { SxProps, Theme } from '@mui/material/styles'
import { Variant } from '@mui/material/styles/createTypography'

interface Props {
  className?: string
  title?: string
  variant?: Variant
  titleColor?: string
  sx?: SxProps<Theme>
  fullHeight?: boolean
  flexDirection?: string
}

const LoadingView = ({ className, title, variant, titleColor, sx, fullHeight = true, flexDirection }: Props) => {
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
        <Typography variant={variant} sx={{ color: titleColor ? titleColor : 'var(--textColor)' }}>
          {title}
        </Typography>
      )}
    </Box>
  )
}

export default LoadingView
