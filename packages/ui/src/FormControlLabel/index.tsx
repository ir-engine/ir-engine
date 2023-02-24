import React, { ReactNode } from 'react'

import { FormControlLabelProps, FormControlLabel as MuiFormControlLabel } from '@mui/material'

import Checkbox from '../Checkbox'

const FormControlLabel = (props: FormControlLabelProps) => <MuiFormControlLabel {...props} />

FormControlLabel.displayName = 'FormControlLabel'

FormControlLabel.defaultProps = {
  control: <Checkbox />,
  label: 'Label'
}

export default FormControlLabel
