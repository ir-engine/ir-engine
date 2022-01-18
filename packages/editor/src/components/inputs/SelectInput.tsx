import React from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import styles from './selectInput.module.scss'

/**
 * @author Robert Long
 */

interface SelectInputProp {
  value: any
  options: Array<{ label: string; value: any }>
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
  placeholder,
  disabled,
  creatable,
  isSearchable,
  onChange
}: SelectInputProp) {
  let v
  if (isSearchable) {
    v = options.find((el) => el.value === value)?.label
  }

  const [valueSelected, setValue] = React.useState(value)
  const [valueAutoSelected, setAutoValue] = React.useState(v)

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value)
    onChange?.(event.target.value)
  }

  const onValueChanged = (event, values) => {
    setAutoValue(values.label)
    onChange?.(values.value)
  }

  const Component = isSearchable ? (
    <Autocomplete
      options={options}
      onChange={onValueChanged}
      freeSolo={creatable}
      disablePortal
      value={valueAutoSelected}
      fullWidth
      size="small"
      classes={{
        root: styles.autoComplete,
        input: styles.inputfield,
        inputRoot: styles.inputWrapper,
        endAdornment: styles.adornmentContainer,
        popupIndicator: styles.adornment,
        clearIndicator: styles.adornment,
        popper: styles.popper,
        paper: styles.paper,
        option: styles.option
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          disabled={disabled}
          classes={{
            root: styles.inputfieldContainer
          }}
        />
      )}
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
          size="small"
          classes={{
            select: styles.select,
            icon: styles.icon
          }}
          disabled={disabled}
          MenuProps={{ classes: { paper: styles.paper } }}
          IconComponent={ExpandMoreIcon}
        >
          {options.map((el, index) => (
            <MenuItem value={el.value} key={el.value + index} classes={{ root: styles.menuItem }}>
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
  creatable: false,
  isSearchable: false
}

export default SelectInput
