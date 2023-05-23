import React, { ReactNode } from 'react'

import { Radio as MuiRadio, RadioProps } from '@mui/material'

const Radio = (props: RadioProps) => <MuiRadio {...props} />

Radio.displayName = 'Radio'

Radio.defaultProps = {}

export default Radio
