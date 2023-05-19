import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { InputAdornmentProps, InputAdornment as MuiInputAdornment } from '@mui/material'

const InputAdornment = (props: InputAdornmentProps & { position?: any }) => <MuiInputAdornment {...props} />

InputAdornment.displayName = 'InputAdornment'

InputAdornment.defaultProps = {
  position: 'end',
  children: <Icon type="AccountCircle" />
}

export default InputAdornment
