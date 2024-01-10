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

import React, { useEffect, useState } from 'react'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import FormHelperText from '@etherealengine/ui/src/primitives/mui/FormHelperText'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { useAutocomplete } from '@mui/material'

import { InputMenuItem } from '../InputSelect'
import styles from './index.module.scss'

interface Props {
  data: InputMenuItem[]
  label: string
  value?: string
  disabled?: boolean
  onChange?: (value: any) => void
  freeSolo?: boolean
  error?: string
}

const AutoComplete = ({ data, label, disabled, error, onChange, value = '', freeSolo = false }: Props) => {
  const [localValue, setLocalValue] = useState('')

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e?.target) setLocalValue(e.target.value)
  }

  const handleClear = () => {
    setLocalValue('')
    if (onChange) onChange({ target: { value: '' } })
  }

  const { getRootProps, getInputProps, getListboxProps, getOptionProps, groupedOptions, setAnchorEl } = useAutocomplete(
    {
      id: 'autocomplete',
      freeSolo,
      value: localValue,
      inputValue: localValue,
      options: data,
      onInputChange: handleInputChange,
      getOptionLabel: (option) => option.label || '',
      blurOnSelect: true,
      onChange: (event: React.ChangeEvent, value: any, reason: string) => {
        if (value?.value != null) {
          setLocalValue(value.value)
          ;(getInputProps() as any).ref.current.value = value.value
          if (onChange) onChange({ target: { value: value.value } })
        }
      },
      isOptionEqualToValue: (option, value) => option.value === value.value
    }
  )

  return (
    <React.Fragment>
      <div className={styles.root}>
        <div {...getRootProps()}>
          <div
            ref={setAnchorEl}
            className={`.MuiAutocomplete-endAdornment .MuiAutocomplete-clearIndicator ${styles.inputWrapper}`}
          >
            <fieldset
              aria-hidden="true"
              className={`MuiOutlinedInput-notchedOutline-SCvfC knJUav MuiOutlinedInput-notchedOutline ${
                disabled ? 'disabled' : ''
              }`}
            >
              <legend>
                <span>{capitalizeFirstLetter(label)}</span>
              </legend>
            </fieldset>
            <input
              style={{ margin: 0 }}
              disabled={disabled}
              {...getInputProps()}
              onBlur={(event: any) => {
                getInputProps().onBlur?.(event)
                if (event?.target?.value?.length > 0 && onChange) onChange(event)
                if (event?.target?.value?.length === 0) handleClear()
              }}
            />
            <IconButton
              className={`.MuiAutocomplete-endAdornment ${styles.clearButton}`}
              onClick={() => handleClear()}
              icon={<Icon type="Cancel" />}
            />
          </div>
        </div>
        {groupedOptions.length > 0 && (
          <ul className={styles.listbox} {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li {...getOptionProps({ option, index })}>
                <span>{option.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <FormControl error>
          <FormHelperText>{error}</FormHelperText>
        </FormControl>
      )}
    </React.Fragment>
  )
}

export default AutoComplete
