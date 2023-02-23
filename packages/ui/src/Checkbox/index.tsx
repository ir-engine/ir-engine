import React, { ReactNode } from 'react'

import { CheckboxProps, Checkbox as MuiCheckbox } from '@mui/material'

const Checkbox = (props: CheckboxProps) => <MuiCheckbox {...props} />

Checkbox.displayName = 'Checkbox'

Checkbox.defaultProps = {}

export default Checkbox
