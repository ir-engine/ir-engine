import React from 'react'
import Paper from '@mui/material/Paper'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useStyles } from '../styles/ui'

interface Props {
  formErrors: any
  value: string
  handleInputChange: (e: any) => void
  name: string
  menu: any
}

const InputSelect = ({ formErrors, value, handleInputChange, name, menu }: Props) => {
  const classes = useStyles()
  return (
    <Paper component="div" className={formErrors.length > 0 ? classes.redBorder : classes.createInput}>
      <FormControl fullWidth disabled={menu.length > 0 ? false : true}>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          value={value}
          fullWidth
          onChange={handleInputChange}
          name={name}
          displayEmpty
          className={classes.select}
          MenuProps={{ classes: { paper: classes.selectPaper } }}
        >
          <MenuItem value="" disabled>
            <em>Select {name}</em>
          </MenuItem>
          {menu.map((el) => (
            <MenuItem value={el.value} key={el.value}>
              {el.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  )
}

export default InputSelect
