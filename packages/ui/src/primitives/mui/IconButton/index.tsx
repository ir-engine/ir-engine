/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import CloseIcon from '@mui/icons-material/Close'
import { IconButtonProps, default as MUIIconButton } from '@mui/material/IconButton'
import React from 'react'

import { handleSoundEffect } from '@ir-engine/client-core/src/common/utils'

// @ts-ignore
import styles from './index.module.scss'

const IconButton = ({
  background,
  className,
  color,
  edge,
  disabled,
  disableRipple,
  icon,
  id,
  size, // 'small' | 'medium' | 'large'
  sizePx,
  sx,
  title,
  type, // 'default' | 'glow' | 'gradient' | 'solid'
  onClick,
  ...props
}: IconButtonProps & {
  background?: string
  icon?: React.ReactNode
  sizePx?: number
  type?: any
}) => {
  let baseStyle = styles.iconButton

  if (type === 'glow') {
    baseStyle = `${baseStyle} ${styles.iconButtonGlow}`
  } else if (type === 'gradient') {
    baseStyle = `${baseStyle} ${styles.iconButtonGradient}`
  } else if (type === 'solid') {
    baseStyle = `${baseStyle} ${styles.iconButtonSolid}`
  }

  return (
    <MUIIconButton
      id={id}
      className={`${baseStyle} ${background ? styles.backgroundStyle : ''} ${className ?? ''}`}
      disabled={disabled}
      disableRipple={disableRipple}
      size={size}
      edge={edge}
      sx={{
        height: sizePx ? `${sizePx}px` : 'auto',
        width: sizePx ? `${sizePx}px` : 'auto',
        background: background ? `${background} !important` : 'auto',
        ...sx
      }}
      title={title}
      onClick={onClick}
      onPointerUp={handleSoundEffect}
      onPointerEnter={handleSoundEffect}
      {...props}
    >
      {icon}
    </MUIIconButton>
  )
}

IconButton.displayName = 'IconButton'

IconButton.defaultProps = {
  icon: <CloseIcon />
}

export default IconButton
