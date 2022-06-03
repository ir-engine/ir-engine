import _ from 'lodash'
import React from 'react'

import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import styles from '../styles/admin.module.scss'

interface Props {
  value: string
  handleInputChange: (e: any) => void
  name: string
  label?: string
  error?: string
}

const InputText = ({ value, handleInputChange, name, label, error }: Props) => {
  return (
    <React.Fragment>
      {label && <label>{_.upperFirst(label)}</label>}
      <Paper component="div" className={error ? styles.redBorder : styles.createInput}>
        <InputBase
          name={name}
          className={styles.input}
          placeholder={`Enter ${label}`}
          value={value}
          onChange={handleInputChange}
        />
      </Paper>
    </React.Fragment>
  )
}

export default InputText
