import React from 'react'
import { useTranslation } from 'react-i18next'

import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'

import styles from '../styles/admin.module.scss'

interface Props {
  formErrors: any
  value: string
  handleInputChange: (e: any) => void
  name: string
  menu: any
}

const InputSelect = ({ formErrors, value, handleInputChange, name, menu }: Props) => {
  const { t } = useTranslation()

  return (
    <Paper component="div" className={formErrors.length > 0 ? styles.redBorder : styles.createInput}>
      <FormControl fullWidth disabled={menu.length > 0 ? false : true}>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          value={value}
          fullWidth
          onChange={handleInputChange}
          name={name}
          displayEmpty
          className={styles.select}
          MenuProps={{ classes: { paper: styles.selectPaper } }}
        >
          <MenuItem
            value=""
            disabled
            classes={{
              root: styles.menuItem
            }}
          >
            <em>
              {t('admin:components.common.select')} {name}
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
    </Paper>
  )
}

export default InputSelect
