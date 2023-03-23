import React from 'react'

import Tab from '@etherealengine/ui/src/primitives/mui/Tab'
import { default as MUITabs } from '@etherealengine/ui/src/primitives/mui/Tabs'

import { SxProps, Theme } from '@mui/material/styles'

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
