import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import InputLabel from '@etherealengine/ui/src/primitives/mui/InputLabel'
import OutlinedInput from '@etherealengine/ui/src/primitives/mui/OutlinedInput'

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

  const [cursor, setCursor] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (type === 'number' && ref.current) {
      let input
      for (const child of (ref.current as any)?.children) {
        if (child.tagName === 'INPUT') {
          input = child
        }
      }
      if (input && cursor) input.setSelectionRange(cursor, cursor)
    }
  }, [ref, cursor, value])

  const handleChange = (e) => {
    setCursor(e.target.selectionStart)
    onChange && onChange(e)
  }

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
            onChange={handleChange}
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
