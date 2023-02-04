import React from 'react'

import { InputMenuItem } from '@xrengine/client-core/src/common/components/InputSelect'
import Box from '@xrengine/ui/src/Box'
import FormControl from '@xrengine/ui/src/FormControl'
import FormControlLabel from '@xrengine/ui/src/FormControlLabel'
import FormHelperText from '@xrengine/ui/src/FormHelperText'
import FormLabel from '@xrengine/ui/src/FormLabel'
import Radio from '@xrengine/ui/src/Radio'
import RadioGroup from '@xrengine/ui/src/RadioGroup'

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
  type?: 'inline' | 'block'
  value?: unknown
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputRadio = ({ className, disabled, error, id, label, name, options, sx, type, value, onChange }: Props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <FormControl
        className={`${styles.radioField} ${type === 'block' ? styles.block : ''} ${className ?? ''}`}
        error={error ? true : false}
        disabled={disabled}
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      >
        <FormLabel sx={{ mt: 0.5, mr: 5 }}>{label}</FormLabel>
        <RadioGroup
          id={id}
          name={name}
          row={type !== 'block'}
          sx={{ width: type === 'block' ? '100%' : undefined }}
          value={value}
          onChange={onChange}
        >
          {options.map((el, index) => (
            <>
              <FormControlLabel
                key={index}
                value={el.value}
                control={<Radio onPointerUp={handleSoundEffect} onPointerEnter={handleSoundEffect} />}
                label={el.label}
              />
              {el.overflowContent}
            </>
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
