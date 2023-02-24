import React, { ReactNode } from 'react'

import { FormHelperTextProps, FormHelperText as MuiFormHelperText } from '@mui/material'

const FormHelperText = (props: FormHelperTextProps) => <MuiFormHelperText {...props} />

FormHelperText.displayName = 'FormHelperText'

FormHelperText.defaultProps = { children: null }

export default FormHelperText
