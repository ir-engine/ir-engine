import _ from 'lodash'
import React from 'react'

import InputBase from '@mui/material/InputBase'
import Paper from '@mui/material/Paper'

import styles from '../styles/admin.module.scss'

interface Props {
  name: string
  label?: string
  placeholder?: string
  value: unknown
  error?: string
  type?: string
  disabled?: boolean
  handleInputChange?: (e: any) => void
}

const InputText = ({ value, handleInputChange, name, label, placeholder, error, type, disabled }: Props) => {
  return (
    <React.Fragment>
      {label && <label>{_.upperFirst(label)}</label>}
      <Paper component="div" className={error ? styles.redBorder : styles.createInput}>
        <InputBase
          name={name}
          type={type}
          className={styles.input}
          placeholder={placeholder ? placeholder : `Enter ${label}`}
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
        />
      </Paper>
    </React.Fragment>
  )
}

export default InputText
