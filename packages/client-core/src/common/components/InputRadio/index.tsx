import React from 'react'

import { InputMenuItem } from '@xrengine/client-core/src/common/components/InputSelect'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  className?: string
  disabled?: boolean
  error?: string
  id?: string
  label?: string
  name?: string
  options: InputMenuItem[]
  sx?: SxProps<Theme>
  value?: unknown
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputRadio = ({ className, disabled, error, id, label, name, options, sx, value, onChange }: Props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <FormControl
        className={`${styles.radioField} ${className ?? ''}`}
        error={error ? true : false}
        disabled={disabled}
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        <FormLabel sx={{ mt: 0.5, mr: 5 }}>{label}</FormLabel>
        <RadioGroup id={id} name={name} value={value} onChange={onChange} row>
          {options.map((el, index) => (
            <FormControlLabel
              key={index}
              value={el.value}
              control={<Radio onPointerUp={handleSoundEffect} onPointerEnter={handleSoundEffect} />}
              label={el.label}
            />
          ))}
        </RadioGroup>
      </FormControl>

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Box>
  )
}

export default InputRadio
