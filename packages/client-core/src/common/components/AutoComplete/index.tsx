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

import * as React from 'react'

import capitalizeFirstLetter from '@etherealengine/common/src/utils/capitalizeFirstLetter'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { AutocompleteGetTagProps, useAutocomplete } from '@mui/material'

import styles from './index.module.scss'

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string
  className: any
  disabled?: boolean
}

const Tag = ({ label, disabled, onDelete, ...other }: TagProps) => {
  return (
    <div {...other}>
      <span style={{ opacity: disabled ? 0.5 : 1 }}>{label}</span>
      {!disabled && <Icon type="Close" onClick={onDelete} />}
    </div>
  )
}

export interface AutoCompleteData {
  type: string
}

interface Props {
  data: AutoCompleteData[]
  label: string
  value?: AutoCompleteData[]
  disabled?: boolean
  onChange?: (value: any) => void
}

const AutoComplete = ({ data, label, disabled, onChange, value = [] }: Props) => {
  const { getRootProps, getInputProps, getTagProps, getListboxProps, getOptionProps, groupedOptions, setAnchorEl } =
    useAutocomplete({
      id: 'autocomplete',
      value: value,
      multiple: true,
      options: data,
      disableCloseOnSelect: true,
      getOptionLabel: (option) => option.type,
      onChange: (event: React.ChangeEvent, value: any) => {
        onChange && onChange(value)
      },
      getOptionDisabled: (option) => !!option.disabled,
      isOptionEqualToValue: (option, value) => option.type === value.type
    })

  return (
    <React.Fragment>
      <div className={styles.root}>
        <div {...getRootProps()}>
          <div ref={setAnchorEl} className={styles.inputWrapper}>
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
            {value.map((option: AutoCompleteData, index: number) => (
              <Tag className={styles.tag} label={option.type} disabled={disabled} {...getTagProps({ index })} />
            ))}
            <input style={{ margin: 0 }} disabled={disabled} {...getInputProps()} />
          </div>
        </div>
        {groupedOptions.length > 0 && (
          <ul className={styles.listbox} {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li {...getOptionProps({ option, index })}>
                <span>{option.type}</span>
                <Icon type="Check" fontSize="small" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </React.Fragment>
  )
}

export default AutoComplete
