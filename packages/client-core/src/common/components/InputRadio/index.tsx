import React from 'react'

import { InputMenuItem } from '@etherealengine/client-core/src/common/components/InputSelect'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import FormLabel from '@etherealengine/ui/src/primitives/mui/FormLabel'
import Radio from '@etherealengine/ui/src/primitives/mui/Radio'
import RadioGroup from '@etherealengine/ui/src/primitives/mui/RadioGroup'

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
            <div key={index}>
              <FormControlLabel
                value={el.value}
                control={<Radio onPointerUp={handleSoundEffect} onPointerEnter={handleSoundEffect} />}
                label={el.label}
              />
              {el.overflowContent}
            </div>
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
