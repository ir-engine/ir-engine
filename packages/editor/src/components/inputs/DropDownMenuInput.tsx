import React, { useState } from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MenuIcon from '@mui/icons-material/Menu'
import { Button, ClickAwayListener, Menu } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import styles from './selectInput.module.scss'

interface SelectInputProp {
  options: Array<{ label: string; value: () => any | void }>
}

/**
 *
 * @param {any} value
 * @param {any} options
 * @param {function} onChange
 * @param {string} placeholder
 * @param {boolean} disabled
 * @param {any} error
 * @param {any} styles
 * @param {any} creatable
 * @param {any} rest
 * @returns
 */
export function DropDownMenuInput({ options }: SelectInputProp) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(!open)

  return (
    <>
      <ClickAwayListener onClickAway={toggle}>
        <FormControl>
          <Button variant="contained" onClick={toggle}>
            <MenuIcon />
          </Button>
          <Menu
            open={open}
            size="small"
            // classes={{
            //   select: styles.select,
            //   icon: styles.icon
            // }}
            // disabled={disabled}
            MenuProps={{
              classes: { paper: styles.paper },
              sx: {
                // https://stackoverflow.com/a/69403132/2077741
                '&& .Mui-selected': {
                  backgroundColor: 'var(--dropdownMenuSelectedBackground)'
                }
              }
            }}
          >
            {options.map(({ value, label }, index) => (
              <MenuItem
                onClick={() => {
                  value()
                  setOpen(false)
                }}
                key={label + String(index)}
                classes={{ root: styles.menuItem }}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        </FormControl>
      </ClickAwayListener>
    </>
  )
}

export default DropDownMenuInput
