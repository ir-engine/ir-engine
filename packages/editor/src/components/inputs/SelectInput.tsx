import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useStyle } from './style'

/**
 * @author Robert Long
 */

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
export function SelectInput({ value, options, placeholder, disabled, creatable }: SelectInputProp) {
  const classx = useStyle()

  const [valueSelected, setValue] = React.useState(value)
  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value as string)
  }

  const Component = creatable ? (
    <Autocomplete
      options={options}
      disablePortal
      value={value}
      classes={{ root: classx.autoSelect, inputRoot: classx.inputRoot, listbox: classx.paper }}
      renderInput={(params) => <TextField {...params} disabled={disabled} />}
    />
  ) : (
    <React.Fragment>
      <FormControl fullWidth>
        <Select
          labelId="select-label"
          id="select"
          value={valueSelected}
          onChange={handleChange}
          placeholder={placeholder}
          classes={{ select: classx.select }}
          disabled={disabled}
          MenuProps={{ classes: { paper: classx.paper } }}
        >
          {options.map((el, index) => (
            <MenuItem value={el.value} key={`${el + index}`} classes={{ root: classx.root }}>
              {el.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </React.Fragment>
  )

  return <>{Component}</>
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
