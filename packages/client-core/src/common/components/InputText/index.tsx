import React from 'react'
import { useTranslation } from 'react-i18next'

import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'
import Box from '@xrengine/ui/src/Box'
import FormControl from '@xrengine/ui/src/FormControl'
import FormHelperText from '@xrengine/ui/src/FormHelperText'
import InputLabel from '@xrengine/ui/src/InputLabel'
import OutlinedInput from '@xrengine/ui/src/OutlinedInput'

import { SxProps, Theme } from '@mui/material/styles'

import commonStyles from '../common.module.scss'
import styles from './index.module.scss'

interface Props {
  className?: string
  disabled?: boolean
  endAdornment?: React.ReactNode
  endControl?: React.ReactNode
  endIcon?: React.ReactNode
  endIconTitle?: string
  error?: string
  id?: string
  inputRef?: React.Ref<any>
  label?: string
  name?: string
  placeholder?: string
  startAdornment?: React.ReactNode
  startIcon?: React.ReactNode
  startIconTitle?: string
  sx?: SxProps<Theme>
  type?: string
  value?: unknown
  onChange?: (e: any) => void
  onKeyDown?: (e: any) => void
  onBlur?: (e: any) => void
  onEndIconClick?: (e: any) => void
  onStartIconClick?: (e: any) => void
}

const InputText = ({
  className,
  disabled,
  endAdornment,
  endControl,
  endIcon,
  endIconTitle,
  error,
  id,
  inputRef,
  label,
  name,
  placeholder,
  startAdornment,
  startIcon,
  startIconTitle,
  sx,
  type,
  value,
  onChange,
  onKeyDown,
  onBlur,
  onEndIconClick,
  onStartIconClick
}: Props) => {
  const { t } = useTranslation()

  placeholder = placeholder ? placeholder : `${t('common:components.enter')} ${label}`
  placeholder = disabled ? undefined : placeholder

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <Box sx={{ display: 'flex' }}>
        <FormControl
          variant="outlined"
          className={`${commonStyles.inputField} ${className ?? ''}`}
          error={!!error}
          disabled={disabled}
          focused={true}
          size="small"
        >
          <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

          <OutlinedInput
            disabled={disabled}
            error={!!error}
            fullWidth
            id={id}
            inputRef={inputRef}
            label={capitalizeFirstLetter(label)}
            name={name}
            placeholder={placeholder}
            size={'small'}
            sx={{ opacity: disabled ? 0.38 : 1 }}
            type={type}
            value={value}
            startAdornment={
              <>
                {startIcon && (
                  <IconButton
                    className={styles.iconButton}
                    title={startIconTitle}
                    icon={startIcon}
                    sx={{ ml: -1.5 }}
                    onClick={onStartIconClick}
                  />
                )}
                {startAdornment}
              </>
            }
            endAdornment={
              <>
                {endIcon && (
                  <IconButton
                    className={styles.iconButton}
                    title={endIconTitle}
                    icon={endIcon}
                    sx={{ mr: -1.5 }}
                    onClick={onEndIconClick}
                  />
                )}
                {endAdornment}
              </>
            }
            onBlur={onBlur}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />
        </FormControl>

        {endControl}
      </Box>

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Box>
  )
}

export default InputText
