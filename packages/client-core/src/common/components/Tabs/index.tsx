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

import Tab from '@etherealengine/ui/src/primitives/mui/Tab'
import { default as MUITabs } from '@etherealengine/ui/src/primitives/mui/Tabs'

import { handleSoundEffect } from '../../utils'
import { InputMenuItem } from '../InputSelect'
import styles from './index.module.scss'

interface Props {
  className?: string
  items?: InputMenuItem[]
  value?: string
  sx?: SxProps<Theme>
  onChange?: (value: string) => void
}

const Tabs = ({ className, items, value, sx, onChange }: Props) => {
  return (
    <MUITabs
      className={`${styles.tabs} ${className ?? ''}`}
      value={value}
      variant="fullWidth"
      sx={sx}
      onChange={(_e, value) => onChange && onChange(value)}
    >
      {items?.map((item) => (
        <Tab
          key={`${item.value}-${item.label}`}
          value={item.value}
          label={item.label}
          onPointerUp={handleSoundEffect}
          onPointerEnter={handleSoundEffect}
        />
      ))}
    </MUITabs>
  )
}

export default Tabs
