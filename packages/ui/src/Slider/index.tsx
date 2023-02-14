import React, { ReactNode } from 'react'

import { Slider as MuiSlider, SliderProps } from '@mui/material'

const Slider = (props: SliderProps) => <MuiSlider {...props} />

Slider.displayName = 'Slider'

Slider.defaultProps = { children: null }

export default Slider
