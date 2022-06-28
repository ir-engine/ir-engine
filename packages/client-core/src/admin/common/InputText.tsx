import _ from 'lodash'
import React from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import { SxProps, Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'

import styles from '../styles/admin.module.scss'

interface Props {
  className?: string
  name?: string
  label?: string
  value?: unknown
  placeholder?: string
  error?: string
  type?: string
  disabled?: boolean
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  sx?: SxProps<Theme>
  onChange?: (e: any) => void
}

const InputText = ({
  className,
  name,
  label,
  value,
  placeholder,
  error,
  type,
  disabled,
  startAdornment,
  endAdornment,
  sx,
  onChange
}: Props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <TextField
        className={className ?? styles.textField}
        variant="outlined"
        name={name}
        type={type}
        placeholder={placeholder ? placeholder : `Enter ${label}`}
        label={_.upperFirst(label)}
        value={value}
        error={error ? true : false}
        disabled={disabled}
        size={'small'}
        onChange={onChange}
        InputProps={{
          className: styles.input,
          startAdornment: startAdornment,
          endAdornment: endAdornment
        }}
        fullWidth
      />

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Box>
  )
}

export default InputText
