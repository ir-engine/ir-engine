import React from 'react'

import Text from '@etherealengine/client-core/src/common/components/Text'
import Box from '@etherealengine/ui/src/Box'
import Slider from '@etherealengine/ui/src/Slider'

import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  className?: string
  icon?: React.ReactNode
  id?: string
  label?: string
  max?: number
  min?: number
  name?: string
  step?: number
  sx?: SxProps<Theme>
  value?: number
  onChange?: (value: number) => void
}

const InputSlider = ({ className, icon, id, label, max, min, name, step, sx, value, onChange }: Props) => {
  return (
    <Box className={className} sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1, ...sx }}>
      {icon}

      <Text className={styles.label} variant="body2" ml={1} mr={1}>
        {label}
      </Text>

      <Slider
        className={styles.slider}
        id={id}
        max={max}
        min={min}
        name={name}
        step={step}
        value={value}
        onChange={(_, value: number) => onChange && onChange(value)}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      />
    </Box>
  )
}

export default InputSlider
