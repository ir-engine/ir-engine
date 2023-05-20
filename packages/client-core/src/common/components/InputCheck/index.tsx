import React from 'react'

import Text from '@etherealengine/client-core/src/common/components/Text'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'
import FormControlLabel from '@etherealengine/ui/src/primitives/mui/FormControlLabel'

import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  checked?: boolean
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  id?: string
  label?: string
  name?: string
  sx?: SxProps<Theme>
  type?: 'default' | 'wide'
  onChange?: (checked: boolean) => void
}

const InputCheck = ({ checked, className, disabled, icon, id, label, name, sx, type, onChange }: Props) => {
  if (type === 'wide') {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1, ...sx }}>
        {icon}

        <Text className={styles.label} variant="body2" ml={1} mr={1}>
          {label}
        </Text>

        <Checkbox
          name={name}
          className={styles.checkbox}
          classes={{ checked: styles.checkedCheckbox }}
          color="primary"
          checked={checked}
          disabled={disabled}
          id={id}
          sx={sx}
          onChange={(_event, checked) => onChange && onChange(checked)}
          onPointerUp={handleSoundEffect}
          onPointerEnter={handleSoundEffect}
        />
      </Box>
    )
  }

  return (
    <FormControlLabel
      className={`${styles.checkbox} ${className ?? ''}`}
      control={
        <Checkbox
          name={name}
          className={styles.checkbox}
          classes={{ checked: styles.checkedCheckbox }}
          color="primary"
          checked={checked}
          disabled={disabled}
          sx={sx}
          onChange={(_event, checked) => onChange && onChange(checked)}
          onPointerUp={handleSoundEffect}
          onPointerEnter={handleSoundEffect}
        />
      }
      label={label}
    />
  )
}

export default InputCheck
