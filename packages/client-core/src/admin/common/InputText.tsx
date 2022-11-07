import React from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'

import { InputLabel, OutlinedInput } from '@mui/material'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import { SxProps, Theme } from '@mui/material/styles'

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
  onKeyDown?: (e: any) => void
  onBlur?: (e: any) => void
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
  onChange,
  onKeyDown,
  onBlur
}: Props) => {
  const { t } = useTranslation()

  placeholder = placeholder ? placeholder : `${t('admin:components.common.enter')} ${label}`
  placeholder = disabled ? undefined : placeholder

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <FormControl
        variant="outlined"
        className={className ?? styles.inputField}
        error={!!error}
        disabled={disabled}
        focused={true}
        size="small"
      >
        <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

        <OutlinedInput
          name={name}
          type={type}
          placeholder={placeholder}
          label={capitalizeFirstLetter(label)}
          value={value}
          error={!!error}
          disabled={disabled}
          size={'small'}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
          sx={{ opacity: disabled ? 0.38 : 1 }}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          fullWidth
        />
      </FormControl>

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Box>
  )
}

export default InputText
