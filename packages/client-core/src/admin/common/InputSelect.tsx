import _ from 'lodash'
import React from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import styles from '../styles/admin.module.scss'

interface Props {
  className?: string
  name?: string
  label?: string
  value?: unknown
  menu: InputMenuItem[]
  error?: string
  disabled?: boolean
  startAdornment?: React.ReactNode
  endAdornment?: React.ReactNode
  endControl?: React.ReactNode
  onChange?: (e: any) => void
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
  startAdornment,
  endAdornment,
  endControl,
  onChange
}: Props) => {
  const { t } = useTranslation()

  if (!disabled) {
    disabled = menu.length > 0 ? false : true
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <FormControl
        variant="outlined"
        className={className ?? styles.selectField}
        error={error ? true : false}
        disabled={disabled}
        size="small"
        sx={{ flexGrow: 1 }}
      >
        <InputLabel>{_.upperFirst(label)}</InputLabel>
        <Select
          name={name}
          value={value}
          label={_.upperFirst(label)}
          disabled={disabled}
          fullWidth
          MenuProps={{ classes: { paper: styles.selectPaper } }}
          inputProps={{
            startAdornment: startAdornment,
            endAdornment: endAdornment
          }}
          size={'small'}
          onChange={onChange}
        >
          <MenuItem
            value=""
            disabled
            classes={{
              root: styles.menuItem
            }}
          >
            <em>
              {t('admin:components.common.select')} {label}
            </em>
          </MenuItem>
          {menu.map((el, index) => (
            <MenuItem
              value={el.value}
              key={index}
              classes={{
                root: styles.menuItem
              }}
            >
              {el.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {endControl}
    </Box>
  )
}

export default InputSelect
