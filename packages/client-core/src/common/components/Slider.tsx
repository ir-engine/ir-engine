import React from 'react'

import Slider from '@mui/material/Slider'

interface Props {
  value: number
  onChange: (event: Event, value: number | number[], activeThumb: number) => void
  arialabelledby: string
}

const CommonSlider = (props: Props): JSX.Element => (
  <Slider value={props.value} onChange={props.onChange} aria-labelledby={props.arialabelledby} />
)

export default CommonSlider
