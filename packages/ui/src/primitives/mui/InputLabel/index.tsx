import React, { ReactNode } from 'react'

import { InputLabelProps, InputLabel as MuiInputLabel } from '@mui/material'

const InputLabel = (props: InputLabelProps) => <MuiInputLabel {...props} />

InputLabel.displayName = 'InputLabel'

InputLabel.defaultProps = { children: null }

export default InputLabel
