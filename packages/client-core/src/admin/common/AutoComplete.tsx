import _ from 'lodash'
import * as React from 'react'

import { AutocompleteGetTagProps, useAutocomplete } from '@mui/base/AutocompleteUnstyled'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

import styles from '../styles/autocomplete.module.scss'

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string
  className: any
}

const Tag = ({ label, onDelete, ...other }: TagProps) => {
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  )
}

export interface AutoCompleteData {
  type: string
}

interface Props {
  data: AutoCompleteData[]
  label: string
  scopes?: any
  onChange: (value: any) => void
}

const AutoComplete = ({ data, label, onChange, scopes = [] }: Props) => {
  const {
    getRootProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl
  } = useAutocomplete({
    id: 'customized-hook-demo',
    defaultValue: scopes,
    multiple: true,
    options: data,
    disableCloseOnSelect: true,
    getOptionLabel: (option) => option.type,
    onChange: (event: React.ChangeEvent<{}>, value: any) => {
      onChange(value)
    },
    getOptionDisabled: (option) => !!option.disabled,
    isOptionEqualToValue: (option, value) => option.type === value.type
  })
  return (
    <React.Fragment>
      <div className={styles.root}>
        <div {...getRootProps()}>
          <div ref={setAnchorEl} className={`${styles.inputWrapper} ${focused ? 'focused' : ''}`}>
            <fieldset
              aria-hidden="true"
              className="MuiOutlinedInput-notchedOutline-SCvfC knJUav MuiOutlinedInput-notchedOutline"
            >
              <legend>
                <span>{_.upperFirst(label)}</span>
              </legend>
            </fieldset>
            {value.map((option: AutoCompleteData, index: number) => (
              <Tag className={styles.tag} label={option.type} {...getTagProps({ index })} />
            ))}
            <input {...getInputProps()} />
          </div>
        </div>
        {groupedOptions.length > 0 && (
          <ul className={styles.listbox} {...getListboxProps()}>
            {(groupedOptions as typeof data).map((option, index) => (
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
