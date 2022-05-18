import _ from 'lodash'
import React from 'react'

import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import styles from '../styles/admin.module.scss'

interface Props {
  value: string
  formErrors: string
  handleInputChange: (e: any) => void
  name: string
}

const InputText = ({ value, handleInputChange, formErrors, name }: Props) => {
  return (
    <React.Fragment>
      <label>{_.upperFirst(name)}</label>
      <Paper component="div" className={formErrors.length > 0 ? styles.redBorder : styles.createInput}>
        <InputBase
          name={name}
          className={styles.input}
          placeholder={`Enter ${name}`}
          value={value}
          onChange={handleInputChange}
        />
      </Paper>
    </React.Fragment>
  )
}

export default InputText
