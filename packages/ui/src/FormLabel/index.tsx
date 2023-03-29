import React, { ReactNode } from 'react'

import { FormLabelProps, FormLabel as MuiFormLabel } from '@mui/material'

const FormLabel = (props: FormLabelProps) => <MuiFormLabel {...props} />

FormLabel.displayName = 'FormLabel'

FormLabel.defaultProps = { children: null }

export default FormLabel
