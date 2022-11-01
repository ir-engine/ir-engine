import React from 'react'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Autocomplete from '@mui/material/Autocomplete'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import styles from './selectInput.module.scss'

interface SelectInputProp<T> {
  value: T | string
  options: Array<{ label: string; value: T }>
  onChange?: (value: T | string) => void
  placeholder?: string
  disabled?: boolean
  creatable?: boolean
  className?: string
  isSearchable?: boolean
}
export function SelectInput<T extends string | ReadonlyArray<string> | number | undefined>({
  value,
  options,
  onChange,
  placeholder = 'Select...',
  disabled,
  creatable,
  isSearchable
}: SelectInputProp<T>) {
  const [valueSelected, setValue] = React.useState(value)
  const [valueAutoSelected, setAutoValue] = React.useState(options.find((el) => el.value === value)?.label)

  const handleChange = (event: SelectChangeEvent<T>) => {
    setValue(event.target.value)
    onChange?.(event.target.value)
  }

  const onValueChanged = (event, values) => {
    setAutoValue(values.label)
    onChange?.(values.value)
  }

  const Component = isSearchable ? (
    <Autocomplete
      options={options.map(({ label }) => label)}
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
        MenuProps={{
          classes: { paper: styles.paper },
          sx: {
            // https://stackoverflow.com/a/69403132/2077741
            '&& .Mui-selected': {
              backgroundColor: 'var(--dropdownMenuSelectedBackground)'
            }
          }
        }}
        IconComponent={ExpandMoreIcon}
      >
        {options.map((option, index) => (
          <MenuItem value={option.value} key={String(option.value) + String(index)} classes={{ root: styles.menuItem }}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  return <>{Component}</>
}

export default SelectInput
