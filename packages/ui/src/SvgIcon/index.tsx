import React, { ReactNode } from 'react'

import { SvgIcon as MuiSvgIcon, SvgIconProps } from '@mui/material'

const SvgIcon = (props: SvgIconProps) => <MuiSvgIcon {...props} />

SvgIcon.displayName = 'SvgIcon'

SvgIcon.defaultProps = { children: null }

export default SvgIcon
