import React from 'react'

import Text from '@xrengine/client-core/src/common/components/Text'

import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  className?: string
  name?: string
  label?: string
  icon?: React.ReactNode
  value?: number
  max?: number
  min?: number
  step?: number
  sx?: SxProps<Theme>
  onChange?: (value: number) => void
}

const InputSlider = ({ className, name, label, icon, value, max, min, step, sx, onChange }: Props) => {
  return (
    <Box className={className} sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1, ...sx }}>
      {icon}

      <Text className={styles.label} variant="body2" ml={1} mr={1}>
        {label}
      </Text>

      <Slider
        name={name}
        className={styles.slider}
        value={value}
        max={max}
        min={min}
        step={step}
        onChange={(_, value: number) => onChange && onChange(value)}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      />
    </Box>
  )
}

export default InputSlider
