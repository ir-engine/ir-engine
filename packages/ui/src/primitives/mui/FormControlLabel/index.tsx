import React, { ReactNode } from 'react'

import Checkbox from '@etherealengine/ui/src/primitives/mui/Checkbox'

import { FormControlLabelProps, FormControlLabel as MuiFormControlLabel } from '@mui/material'

const FormControlLabel = (props: FormControlLabelProps) => <MuiFormControlLabel {...props} />

FormControlLabel.displayName = 'FormControlLabel'

FormControlLabel.defaultProps = {
  control: <Checkbox />,
  label: 'Label'
}

export default FormControlLabel
