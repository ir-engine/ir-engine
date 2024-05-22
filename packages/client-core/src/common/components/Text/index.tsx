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
import { Variant } from '@mui/material/styles/createTypography'
import React from 'react'

import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  bold?: boolean
  children?: React.ReactNode
  className?: string
  color?: string
  flex?: string | number
  id?: string
  italic?: boolean
  margin?: string | number
  marginTop?: string | number
  marginBottom?: string | number
  marginLeft?: string | number
  marginRight?: string | number
  mt?: string | number
  mb?: string | number
  ml?: string | number
  mr?: string | number
  sx?: SxProps<Theme>
  underline?: boolean
  variant?: Variant
  onClick?: () => void
}

const Text = ({
  align,
  bold,
  children,
  className,
  color,
  flex,
  id,
  italic,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  mt,
  mb,
  ml,
  mr,
  sx,
  underline,
  variant,
  onClick
}: Props) => {
  let baseStyle = ''
  if (onClick) {
    baseStyle = styles.buttonBehavior
  }

  return (
    <Typography
      align={align}
      className={`${baseStyle} ${className ?? ''}`}
      color={color}
      id={id}
      fontWeight={bold ? 900 : undefined}
      fontStyle={italic ? 'italic' : undefined}
      margin={margin}
      marginTop={mt ?? marginTop}
      marginBottom={mb ?? marginBottom}
      marginLeft={ml ?? marginLeft}
      marginRight={mr ?? marginRight}
      sx={{
        color: color ? color : 'var(--textColor)',
        display: 'block',
        textDecoration: underline ? 'underline' : '',
        flex: flex ? flex : '',
        ...sx
      }}
      variant={variant}
      onClick={onClick}
      onPointerUp={() => (onClick ? handleSoundEffect : undefined)}
      onPointerEnter={() => (onClick ? handleSoundEffect : undefined)}
    >
      {children}
    </Typography>
  )
}

export default Text
