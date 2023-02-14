import React from 'react'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import Box from '@xrengine/ui/src/Box'
import FormControlLabel from '@xrengine/ui/src/FormControlLabel'
import Switch from '@xrengine/ui/src/Switch'

import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  className?: string
  checked?: boolean
  disabled?: boolean
  id?: string
  label?: string
  name?: string
  sx?: SxProps<Theme>
  onChange?: (e: any) => void
}

const InputSwitch = ({ className, checked, disabled, id, label, name, sx, onChange }: Props) => {
  return (
    <Box sx={sx}>
      <FormControlLabel
        className={`${styles.switchField} ${className ?? ''}`}
        label={capitalizeFirstLetter(label)}
        control={
          <Switch
            name={name}
            checked={checked}
            disabled={disabled}
            id={id}
            onChange={onChange}
            onPointerUp={handleSoundEffect}
            onPointerEnter={handleSoundEffect}
          />
        }
      />
    </Box>
  )
}

export default InputSwitch
