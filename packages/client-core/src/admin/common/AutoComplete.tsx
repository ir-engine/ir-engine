import * as React from 'react'

import { AutocompleteGetTagProps, useAutocomplete } from '@mui/base/AutocompleteUnstyled'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

import styles from '../styles/autocomplete.module.scss'

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  label: string
  className: any
}

function Tag(props: TagProps) {
  const { label, onDelete, ...other } = props
  return (
    <div {...other}>
      <span>{label}</span>
      <CloseIcon onClick={onDelete} />
    </div>
  )
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #343b41;
  border: 1px solid #23282c;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;
  color: #f1f1f1;
  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
    color: #ffffff;
  }
`
)

export default function AutoComplete({ data, label, handleChangeScopeType, scopes = [] }) {
  const {
    getRootProps,
    getInputLabelProps,
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
      handleChangeScopeType(value)
    },
    getOptionDisabled: (option) => !!option.disabled,
    isOptionEqualToValue: (option, value) => option.type === value.type
  })
  return (
    <div className={styles.root}>
      <div {...getRootProps()}>
        <label className={styles.label} {...getInputLabelProps()}>
          {label}
        </label>
        <div ref={setAnchorEl} className={`${styles.inputWrapper} ${focused ? 'focused' : ''}`}>
          {value.map((option: DataType, index: number) => (
            <Tag className={styles.tag} label={option.type} {...getTagProps({ index })} />
          ))}
          <input {...getInputProps()} />
        </div>
      </div>
      {groupedOptions.length > 0 ? (
        <ul className={styles.listbox} {...getListboxProps()}>
          {(groupedOptions as typeof data).map((option, index) => (
            <li {...getOptionProps({ option, index })}>
              <span>{option.type}</span>
              <CheckIcon fontSize="small" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

interface DataType {
  type: string
}
