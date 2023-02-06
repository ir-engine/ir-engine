import React, { ReactNode } from 'react'

import { InputAdornmentProps, InputAdornment as MuiInputAdornment } from '@mui/material'

import Icon from '../Icon'

const InputAdornment = (props: InputAdornmentProps & { position?: any }) => <MuiInputAdornment {...props} />

InputAdornment.displayName = 'InputAdornment'

InputAdornment.defaultProps = {
  position: 'end',
  children: <Icon type="AccountCircle" />
}

export default InputAdornment
