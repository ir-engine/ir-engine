import React, { ReactNode } from 'react'

import { Select as MuiSelect, SelectProps } from '@mui/material'

const Select = (props: SelectProps) => <MuiSelect {...props} />

Select.displayName = 'Select'

Select.defaultProps = { children: null }

export default Select
