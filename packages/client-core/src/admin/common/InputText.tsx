import React from 'react'
import Paper from '@mui/material/Paper'
import InputBase from '@mui/material/InputBase'
import { useStyles } from '../styles/ui'
import _ from 'lodash'

interface Props {
  value: any
  formErrors: any
  handleInputChange: any
  name: string
}

const InputText = ({ value, handleInputChange, formErrors, name }: Props) => {
  const classes = useStyles()
  return (
    <React.Fragment>
      <label>{_.upperFirst(name)}</label>
      <Paper component="div" className={formErrors.length > 0 ? classes.redBorder : classes.createInput}>
        <InputBase
          name={name}
          className={classes.input}
          placeholder={`Enter ${name}`}
          style={{ color: '#fff' }}
          value={value}
          onChange={handleInputChange}
        />
      </Paper>
    </React.Fragment>
  )
}

export default InputText
