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

import { SxProps, Theme } from '@mui/material/styles'
import React from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import InputLabel from '@etherealengine/ui/src/primitives/mui/InputLabel'
import MenuItem from '@etherealengine/ui/src/primitives/mui/MenuItem'
import Select from '@etherealengine/ui/src/primitives/mui/Select'

import { handleSoundEffect } from '../../utils'
import commonStyles from '../common.module.scss'
import styles from './index.module.scss'

interface Props<T = unknown> {
  className?: string
  disabled?: boolean
  endControl?: React.ReactNode
  error?: string
  id?: string
  label?: string
  menu: InputMenuItem[]
  name?: string
  sx?: SxProps<Theme>
  value?: T
  onChange?: (e: React.ChangeEvent<{ value: T }>, child?: React.ReactNode) => void
}

export interface InputMenuItem {
  value: string | number
  label: React.ReactNode
  disabled?: boolean
  overflowContent?: React.ReactNode
}

function InputSelect<T>({
  className,
  disabled,
  endControl,
  error,
  id,
  label,
  menu,
  name,
  sx,
  value,
  onChange
}: Props<T>) {
  const { t } = useTranslation()

  if (!disabled) {
    disabled = menu.length <= 0
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <Box sx={{ display: 'flex' }}>
        <FormControl
          variant="outlined"
          className={`${commonStyles.inputField} ${className ?? ''}`}
          error={!!error}
          disabled={disabled}
          size="small"
        >
          <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

          <Select
            disabled={disabled}
            displayEmpty
            fullWidth
            id={id}
            label={capitalizeFirstLetter(label)}
            name={name}
            size={'small'}
            sx={{ opacity: disabled ? 0.38 : 1 }}
            value={value}
            MenuProps={{ classes: { paper: styles.selectPaper } }}
            onChange={onChange as any}
            onPointerUp={handleSoundEffect}
            onPointerEnter={handleSoundEffect}
          >
            {!disabled && (
              <MenuItem
                value=""
                disabled
                classes={{
                  root: styles.menuItem
                }}
              >
                <em>
                  {t('common:components.select')} {label}
                </em>
              </MenuItem>
            )}
            {menu.map((el, index) => (
              <MenuItem
                value={el.value}
                key={index}
                classes={{
                  root: styles.menuItem
                }}
                onPointerUp={handleSoundEffect}
                onPointerEnter={handleSoundEffect}
              >
                {el.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {endControl}
      </Box>

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </Box>
  )
}

export default InputSelect
