import React, { ReactNode } from 'react'

import { FormControlProps, FormControl as MuiFormControl } from '@mui/material'

const FormControl = (props: FormControlProps) => <MuiFormControl {...props} />

FormControl.displayName = 'FormControl'

FormControl.defaultProps = { children: null }

export default FormControl
