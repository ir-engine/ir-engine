import React from 'react'
import Slider from '@mui/material/Slider'

interface Props {
  value: number
  onChange: any
  arialabelledby: any
}

const CommonSlider = (props: Props): any => (
  <Slider value={props.value} onChange={props.onChange} aria-labelledby={props.arialabelledby} />
)

export default CommonSlider
