import React from 'react'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'

import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import { SxProps, Theme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'

import styles from '../styles/admin.module.scss'

interface Props {
  className?: string
  name?: string
  label?: string
  checked?: boolean
  disabled?: boolean
  sx?: SxProps<Theme>
  onChange?: (e: any) => void
}

const InputSwitch = ({ className, name, label, checked, disabled, sx, onChange }: Props) => {
  return (
    <Box sx={sx}>
      <FormControlLabel
        className={className ?? styles.switchField}
        label={capitalizeFirstLetter(label)}
        control={<Switch name={name} checked={checked} disabled={disabled} onChange={onChange} />}
      />
    </Box>
  )
}

export default InputSwitch
