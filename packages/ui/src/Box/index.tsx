import React, { ReactNode } from 'react'

import { BoxProps, Box as MuiBox } from '@mui/material'

const Box = ({ children, ...props }: BoxProps) => <MuiBox {...props}>{children}</MuiBox>

Box.displayName = 'Box'

Box.defaultProps = { children: null }

export default Box
