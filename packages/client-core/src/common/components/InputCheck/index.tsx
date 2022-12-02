import React from 'react'

import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import { SxProps, Theme } from '@mui/material/styles'

import styles from './index.module.scss'

interface Props {
  checked?: boolean
  className?: string
  disabled?: boolean
  label?: string
  name?: string
  sx?: SxProps<Theme>
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputRadio = ({ checked, className, disabled, label, name, sx, onChange }: Props) => {
  return (
    <FormControlLabel
      className={`${styles.checkbox} ${className ?? ''}`}
      control={
        <Checkbox
          name={name}
          className={styles.checkbox}
          classes={{ checked: styles.checkedCheckbox }}
          color="primary"
          checked={checked}
          disabled={disabled}
          sx={sx}
          onChange={onChange}
        />
      }
      label={label}
    />
  )
}

export default InputRadio
