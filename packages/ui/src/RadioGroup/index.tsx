import React, { ReactNode } from 'react'

import { RadioGroup as MuiRadioGroup, RadioGroupProps } from '@mui/material'

const RadioGroup = (props: RadioGroupProps) => <MuiRadioGroup {...props} />

RadioGroup.displayName = 'RadioGroup'

RadioGroup.defaultProps = { children: null }

export default RadioGroup
