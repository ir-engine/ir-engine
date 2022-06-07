import _ from 'lodash'
import React from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'

import styles from '../styles/admin.module.scss'

interface Props {
  name: string
  label?: string
  placeholder?: string
  value: unknown
  error?: string
  type?: string
  disabled?: boolean
  endAdornment?: React.ReactNode
  handleInputChange?: (e: any) => void
}

const InputText = ({
  value,
  name,
  label,
  placeholder,
  error,
  type,
  disabled,
  endAdornment,
  handleInputChange
}: Props) => {
  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        className={styles.textField}
        variant="outlined"
        name={name}
        type={type}
        placeholder={placeholder ? placeholder : `Enter ${label}`}
        label={_.upperFirst(label)}
        value={value}
        error={error ? true : false}
        disabled={disabled}
        size={'small'}
        onChange={handleInputChange}
        InputProps={{
          className: styles.input,
          endAdornment: endAdornment
        }}
        fullWidth
      />
    </Box>
  )
}

export default InputText
