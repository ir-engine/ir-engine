import React from 'react'

import { SxProps, Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import { default as MUITabs } from '@mui/material/Tabs'

import { handleSoundEffect } from '../../utils'
import { InputMenuItem } from '../InputSelect'
import styles from './index.module.scss'

interface Props {
  className?: string
  items?: InputMenuItem[]
  value?: string
  sx?: SxProps<Theme>
  disableSoundEffects?: boolean
  onChange?: (value: string) => void
}

const Tabs = ({ className, items, value, sx, disableSoundEffects, onChange }: Props) => {
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
          value={item.value}
          label={item.label}
          onPointerUp={() => handleSoundEffect(disableSoundEffects)}
          onPointerEnter={() => handleSoundEffect(disableSoundEffects)}
        />
      ))}
    </MUITabs>
  )
}

export default Tabs
