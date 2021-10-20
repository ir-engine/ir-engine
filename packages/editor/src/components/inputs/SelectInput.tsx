import React from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'

/**
 * @author Robert Long
 */
const staticStyle = {
  container: (base) => ({
    ...base,
    width: '100%',
    maxWidth: '200px'
  }),
  control: (base, { isDisabled }) => ({
    ...base,
    backgroundColor: isDisabled ? '#222222' : 'black',
    minHeight: '24px',
    border: '1px solid #5D646C',
    cursor: 'pointer'
  }),
  input: (base, { isDisabled }) => ({
    ...base,
    margin: '0px',
    color: isDisabled ? 'grey' : 'white'
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '0 4px 0 0'
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0',
    width: '16px',
    height: '16px',
    alignItems: 'center',
    paddingTop: '1px'
  }),
  menu: (base, { isDisabled }) => ({
    ...base,
    borderRadius: '4px',
    border: '1px solid black',
    backgroundColor: 'black',
    outline: 'none',
    padding: '0',
    position: 'absolute',
    color: isDisabled ? 'grey' : 'white',
    top: '20px'
  }),
  menuList: (base) => ({
    ...base,
    padding: '0'
  }),
  option: (base, { isFocused }) => ({
    ...base,
    backgroundColor: isFocused ? '#006EFF' : 'black',
    cursor: 'pointer'
  }),
  singleValue: (base, { isDisabled }) => ({
    ...base,
    color: isDisabled ? 'grey' : 'white'
  })
}

interface SelectInputProp {
  value: any
  options: any
  onChange?: Function
  placeholder?: string
  disabled?: boolean
  error?: any
  styles?: any
  creatable?: any
  className?: string
  isSearchable?: boolean
  filterOption?: (option: any, searchString: string) => boolean
  getOptionLabel?: (option: any) => any
  formatCreateLabel?: (value: any) => any
  isValidNewOption?: (value: any) => boolean
}

/**
 *
 * @author Robert Long
 * @param {any} value
 * @param {any} options
 * @param {function} onChange
 * @param {string} placeholder
 * @param {boolean} disabled
 * @param {any} error
 * @param {any} styles
 * @param {any} creatable
 * @param {any} rest
 * @returns
 */
export function SelectInput({
  value,
  options,
  onChange,
  placeholder,
  disabled,
  error,
  styles,
  creatable,
  ...rest
}: SelectInputProp) {
  const selectedOption =
    options.find((o) => {
      if (o === null) {
        return o
      } else if (o.value && o.value.equals) {
        return o.value.equals(value)
      } else {
        return o.value === value
      }
    }) || null

  const dynamicStyle = {
    ...staticStyle,
    placeholder: (base, { isDisabled }) => ({
      ...base,
      color: isDisabled ? 'grey' : error ? 'red' : 'white'
    }),
    ...styles
  }

  const Component = creatable ? CreatableSelect : Select

  return (
    <Component
      {...rest}
      styles={dynamicStyle}
      value={selectedOption}
      components={{ IndicatorSeparator: () => null }}
      placeholder={placeholder}
      options={options}
      onChange={(option) => onChange(option && option.value, option)}
      isDisabled={disabled}
    />
  )
}
SelectInput.defaultProps = {
  value: null,
  placeholder: 'Select...',
  optionNotFoundPlaceholder: 'Error',
  onChange: () => {},
  styles: {},
  error: false,
  disabled: false,
  creatable: false
}
export default SelectInput
