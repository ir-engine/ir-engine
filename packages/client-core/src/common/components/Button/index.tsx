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

import { SxProps, Theme } from '@mui/material/styles'
import React from 'react'

import Text from '@etherealengine/client-core/src/common/components/Text'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import { default as MUIButton } from '@etherealengine/ui/src/primitives/mui/Button'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  autoFocus?: boolean
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  disableRipple?: boolean
  endIcon?: React.ReactNode
  fullWidth?: boolean
  id?: string
  open?: boolean
  size?: 'medium'
  startIcon?: React.ReactNode
  sx?: SxProps<Theme>
  title?: string
  type?: 'outlined' | 'gradient' | 'gradientRounded' | 'solid' | 'solidRounded' | 'expander'
  width?: string
  onClick?: () => void
}

const Button = ({
  autoFocus,
  children,
  className,
  disabled,
  disableRipple,
  endIcon,
  fullWidth,
  id,
  open,
  size,
  startIcon,
  sx,
  title,
  type,
  width,
  onClick
}: Props) => {
  if (type === 'expander') {
    return (
      <Box
        id={id}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ...sx }}
        onClick={onClick}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      >
        <Text variant="body2">{children}</Text>
        <IconButton icon={open ? <Icon type="KeyboardArrowUp" /> : <Icon type="KeyboardArrowDown" />} />
      </Box>
    )
  }

  let baseStyle = ''
  if (type === 'outlined') {
    baseStyle = styles.outlinedButton
  } else if (type === 'gradient' || type === 'gradientRounded') {
    baseStyle = styles.gradientButton
  } else if (type === 'solid' || type === 'solidRounded') {
    baseStyle = styles.solidButton
  }

  if (type === 'gradientRounded' || type === 'solidRounded') {
    baseStyle = `${baseStyle} ${styles.roundedButton}`
  }

  let newSx: SxProps<Theme> = { ...sx }
  if (fullWidth) {
    newSx = { width: '100%', ...sx }
  }
  if (size === 'medium') {
    newSx = { width: '100%', maxWidth: '250px', ...sx }
  }
  if (width) {
    newSx = { width: width, ...sx }
  }

  return (
    <MUIButton
      autoFocus={autoFocus}
      className={`${baseStyle} ${className ?? ''}`}
      disabled={disabled}
      disableRipple={disableRipple}
      endIcon={endIcon}
      id={id}
      startIcon={startIcon}
      sx={newSx}
      title={title}
      onClick={onClick}
      onPointerUp={handleSoundEffect}
      onPointerEnter={handleSoundEffect}
    >
      {children}
    </MUIButton>
  )
}

export default Button
