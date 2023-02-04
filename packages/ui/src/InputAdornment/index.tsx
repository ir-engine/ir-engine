import React, { ReactNode } from 'react'

import { InputAdornmentProps, InputAdornment as MuiInputAdornment } from '@mui/material'

const InputAdornment = (props: InputAdornmentProps) => <MuiInputAdornment {...props} />

InputAdornment.displayName = 'InputAdornment'

InputAdornment.defaultProps = {
  position: undefined
}

export default InputAdornment
