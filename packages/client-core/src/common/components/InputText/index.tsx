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
import React, { RefObject, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import { useHookstate } from '@etherealengine/hyperflux'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import InputLabel from '@etherealengine/ui/src/primitives/mui/InputLabel'
import OutlinedInput from '@etherealengine/ui/src/primitives/mui/OutlinedInput'

import commonStyles from '../common.module.scss'
import styles from './index.module.scss'

interface Props {
  className?: string
  disabled?: boolean
  endAdornment?: React.ReactNode
  endControl?: React.ReactNode
  endIcon?: React.ReactNode
  endIconTitle?: string
  error?: string
  id?: string
  inputRef?: React.Ref<any>
  label?: string
  name?: string
  placeholder?: string
  startAdornment?: React.ReactNode
  startIcon?: React.ReactNode
  startIconTitle?: string
  sx?: SxProps<Theme>
  type?: string
  value?: unknown
  onChange?: (e: any) => void
  onKeyDown?: (e: any) => void
  onBlur?: (e: any) => void
  onEndIconClick?: (e: any) => void
  onStartIconClick?: (e: any) => void
}

const InputText = ({
  className,
  disabled,
  endAdornment,
  endControl,
  endIcon,
  endIconTitle,
  error,
  id,
  inputRef = useRef(),
  label,
  name,
  placeholder,
  startAdornment,
  startIcon,
  startIconTitle,
  sx,
  type,
  value,
  onChange,
  onKeyDown,
  onBlur,
  onEndIconClick,
  onStartIconClick
}: Props) => {
  const { t } = useTranslation()

  placeholder = placeholder ? placeholder : `${t('common:components.enter')} ${label}`
  placeholder = disabled ? undefined : placeholder

  const cursor = useHookstate(null)

  useEffect(() => {
    if (type !== 'number' && (inputRef as RefObject<any>)?.current && cursor.value)
      (inputRef as RefObject<any>).current.setSelectionRange(cursor.value, cursor.value)
  }, [inputRef, cursor.value, value])

  const handleChange = (e) => {
    cursor.set(e.target.selectionStart)
    onChange && onChange(e)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, ...sx }}>
      <Box sx={{ display: 'flex' }}>
        <FormControl
          variant="outlined"
          className={`${commonStyles.inputField} ${className ?? ''}`}
          error={!!error}
          disabled={disabled}
          focused={true}
          size="small"
        >
          <InputLabel sx={{ zIndex: 999 }}>{capitalizeFirstLetter(label)}</InputLabel>

          <OutlinedInput
            disabled={disabled}
            error={!!error}
            fullWidth
            id={id}
            inputRef={inputRef}
            label={capitalizeFirstLetter(label)}
            name={name}
            placeholder={placeholder}
            size={'small'}
            sx={{ opacity: disabled ? 0.38 : 1 }}
            type={type}
            value={value}
            startAdornment={
              <>
                {startIcon && (
                  <IconButton
                    className={styles.iconButton}
                    title={startIconTitle}
                    icon={startIcon}
                    sx={{ ml: -1.5 }}
                    onClick={onStartIconClick}
                  />
                )}
                {startAdornment}
              </>
            }
            endAdornment={
              <>
                {endIcon && (
                  <IconButton
                    className={styles.iconButton}
                    title={endIconTitle}
                    icon={endIcon}
                    sx={{ mr: -1.5 }}
                    onClick={onEndIconClick}
                  />
                )}
                {endAdornment}
              </>
            }
            onBlur={onBlur}
            onChange={handleChange}
            onKeyDown={onKeyDown}
          />
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

export default InputText
