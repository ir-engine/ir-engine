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

import { handleSoundEffect } from '../../utils'
import commonStyles from '../common.module.scss'
import styles from './index.module.scss'

interface Props {
  className?: string
  disabled?: boolean
  endControl?: React.ReactNode
  error?: string
  id?: string
  label?: string
  menu: InputMenuItem[]
  name?: string
  sx?: SxProps<Theme>
  value?: unknown
  onChange?: (e: any) => void
}

export interface InputMenuItem {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

const InputSelect = ({ className, disabled, endControl, error, id, label, menu, name, sx, value, onChange }: Props) => {
  const { t } = useTranslation()

  if (!disabled) {
    disabled = menu.length <= 0
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <Box sx={{ display: 'flex' }}>
        <FormControl
          variant="outlined"
          className={`${commonStyles.inputField} ${className ?? ''}`}
          error={!!error}
          disabled={disabled}
          size="small"
          sx={{ flexGrow: 1 }}
        >
          <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

          <Select
            disabled={disabled}
            displayEmpty
            fullWidth
            id={id}
            label={capitalizeFirstLetter(label)}
            name={name}
            size={'small'}
            sx={{ opacity: disabled ? 0.38 : 1 }}
            value={value}
            MenuProps={{ classes: { paper: styles.selectPaper } }}
            onChange={onChange}
            onPointerUp={handleSoundEffect}
            onPointerEnter={handleSoundEffect}
          >
            {!disabled && (
              <MenuItem
                value=""
                disabled
                classes={{
                  root: styles.menuItem
                }}
              >
                <em>
                  {t('common:components.select')} {label}
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
                onPointerUp={handleSoundEffect}
                onPointerEnter={handleSoundEffect}
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
