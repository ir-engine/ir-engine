import React, { ReactNode } from 'react'

import { OutlinedInput as MuiOutlinedInput, OutlinedInputProps } from '@mui/material'

const OutlinedInput = (props: OutlinedInputProps) => <MuiOutlinedInput {...props} />

OutlinedInput.displayName = 'OutlinedInput'

OutlinedInput.defaultProps = {}

export default OutlinedInput
