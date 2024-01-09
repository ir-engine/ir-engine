/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import Text from '@etherealengine/client-core/src/common/components/Text'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Slider from '@etherealengine/ui/src/primitives/mui/Slider'

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
  displaySliderLabel?: boolean
}

const InputSlider = ({
  className,
  icon,
  id,
  label,
  max,
  min,
  name,
  step,
  sx,
  value,
  displaySliderLabel,
  onChange
}: Props) => {
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
        valueLabelDisplay={displaySliderLabel ? 'on' : 'auto'}
      />
    </Box>
  )
}

export default InputSlider
