import * as React from 'react'

import capitalizeFirstLetter from '@xrengine/common/src/utils/capitalizeFirstLetter'

import { AutocompleteGetTagProps, useAutocomplete } from '@mui/base/AutocompleteUnstyled'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import styles from '../styles/autocomplete.module.scss'

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string
  className: any
  disabled?: boolean
}

const Tag = ({ label, disabled, onDelete, ...other }: TagProps) => {
  return (
    <div {...other}>
      <span style={{ opacity: disabled ? 0.5 : 1 }}>{label}</span>
      {!disabled && <CloseIcon onClick={onDelete} />}
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
      onChange: (event: React.ChangeEvent<{}>, value: any) => {
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
            <input disabled={disabled} {...getInputProps()} />
          </div>
        </div>
        {groupedOptions.length > 0 && (
          <ul className={styles.listbox} {...getListboxProps()}>
            {groupedOptions.map((option, index) => (
              <li {...getOptionProps({ option, index })}>
                <span>{option.type}</span>
                <CheckIcon fontSize="small" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </React.Fragment>
  )
}

export default AutoComplete
