/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import Box from '@etherealengine/ui/src/primitives/mui/Box'
import CircularProgress from '@etherealengine/ui/src/primitives/mui/CircularProgress'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { SxProps, Theme } from '@mui/material/styles'
import { Variant } from '@mui/material/styles/createTypography'

interface Props {
  className?: string
  title?: React.ReactNode
  description?: string
  variant?: Variant
  titleColor?: string
  sx?: SxProps<Theme>
  fullHeight?: boolean
  flexDirection?: string
}

const LoadingView = ({
  className,
  title,
  description,
  variant,
  titleColor,
  sx,
  fullHeight = true,
  flexDirection
}: Props) => {
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
      {description && (
        <Typography variant={'body2'} sx={{ color: 'var(--textColor)', opacity: 0.65 }}>
          {description}
        </Typography>
      )}
    </Box>
  )
}

export default LoadingView
