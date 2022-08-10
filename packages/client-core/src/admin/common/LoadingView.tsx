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
}

const LoadingView = ({ className, title, variant, titleColor, sx }: Props) => {
  if (!variant) {
    variant = 'h6'
  }

  const content = (
    <Box
      className={className}
      sx={{
        height: '100%',
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

  return content
}

export default LoadingView
