import React, { ReactNode } from 'react'

import { FormGroupProps, FormGroup as MuiFormGroup } from '@mui/material'

const FormGroup = (props: FormGroupProps) => <MuiFormGroup {...props} />

FormGroup.displayName = 'FormGroup'

FormGroup.defaultProps = { children: null }

export default FormGroup
