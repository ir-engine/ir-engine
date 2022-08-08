import React from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { SxProps, Theme } from '@mui/material/styles'

import styles from '../styles/admin.module.scss'

interface Props {
  className?: string
  name?: string
  label?: string
  value?: unknown
  menu: InputMenuItem[]
  error?: string
  disabled?: boolean
  endControl?: React.ReactNode
  sx?: SxProps<Theme>
  onChange?: (e: any) => void
  onPointerEnter?: (e: any) => void
  onPointerUp?: (e: any) => void
}

export interface InputMenuItem {
  value: string
  label: string
}

const InputSelect = ({
  className,
  name,
  label,
  value,
  menu,
  error,
  disabled,
  endControl,
  sx,
  onChange,
  onPointerEnter,
  onPointerUp
}: Props) => {
  const { t } = useTranslation()

  if (!disabled) {
    disabled = menu.length > 0 ? false : true
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <Box sx={{ display: 'flex' }}>
        <FormControl
          variant="outlined"
          className={className ?? styles.inputField}
          error={error ? true : false}
          disabled={disabled}
          size="small"
          sx={{ flexGrow: 1 }}
        >
          <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

          <Select
            name={name}
            value={value}
            label={capitalizeFirstLetter(label)}
            disabled={disabled}
            size={'small'}
            sx={{ opacity: disabled ? 0.38 : 1 }}
            fullWidth
            displayEmpty
            MenuProps={{ classes: { paper: styles.selectPaper } }}
            onChange={onChange}
            onPointerEnter={onPointerEnter}
            onPointerUp={onPointerUp}
          >
            {!disabled && (
              <MenuItem
                value=""
                disabled
                classes={{
                  root: styles.menuItem
                }}
                onPointerEnter={onPointerEnter}
                onPointerUp={onPointerUp}
              >
                <em>
                  {t('admin:components.common.select')} {label}
                </em>
              </MenuItem>
            )}
            {menu.map((el, index) => (
              <MenuItem
                value={el.value}
                key={index}
                classes={{
                  root: styles.menuItem
                }}
                onPointerEnter={onPointerEnter}
                onPointerUp={onPointerUp}
              >
                {el.label}
              </MenuItem>
            ))}
          </Select>
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

export default InputSelect
