/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { SxProps, Theme } from '@mui/material/styles'
import React from 'react'

import Text from '@ir-engine/client-core/src/common/components/Text'
import Box from '@ir-engine/ui/src/primitives/mui/Box'
import Checkbox from '@ir-engine/ui/src/primitives/mui/Checkbox'
import FormControlLabel from '@ir-engine/ui/src/primitives/mui/FormControlLabel'

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
