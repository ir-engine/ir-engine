import React, { ReactNode } from 'react'

import { InputBaseProps, InputBase as MuiInputBase } from '@mui/material'

const InputBase = (props: InputBaseProps) => <MuiInputBase {...props} />

InputBase.displayName = 'InputBase'

InputBase.defaultProps = {
  defaultChecked: true,
  inputProps: { 'aria-label': 'InputBase demo' }
}

export default InputBase
