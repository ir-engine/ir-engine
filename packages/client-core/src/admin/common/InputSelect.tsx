import _ from 'lodash'
import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'

import styles from '../styles/admin.module.scss'

interface Props {
  value: string
  handleInputChange: (e: any) => void
  name: string
  menu: InputSelectProps[]
  error?: string
  label?: string
  endControl?: ReactNode
}

export interface InputSelectProps {
  value: string
  label: string
}

const InputSelect = ({ error, value, handleInputChange, name, menu, label, endControl }: Props) => {
  const { t } = useTranslation()

  return (
    <React.Fragment>
      {label && <label>{_.upperFirst(label)}</label>}
      <Box sx={{ display: 'flex' }}>
        <Paper component="div" className={error ? styles.redBorder : styles.createInput} sx={{ flexGrow: 1 }}>
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
        </Paper>
        {endControl}
      </Box>
    </React.Fragment>
  )
}

export default InputSelect
