import React from 'react'

import styleString from './index.scss'

type labelPositionVariant = 'start' | 'end' | 'none'

const XRSlider = (props) => {
  const {
    labelPosition = 'start',
    labelContent,
    ...inputProps
  }: { labelPosition: labelPositionVariant; labelContent: any; inputProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      {labelPosition === 'start' && <span className="label">{labelContent}</span>}
      <input className="slider" type="range" {...inputProps} />
      {labelPosition === 'end' && <span className="label">{labelContent}</span>}
    </>
  )
}

export default XRSlider
