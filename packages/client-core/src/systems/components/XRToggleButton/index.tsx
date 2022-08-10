import React from 'react'

import styleString from './index.scss'

type labelPositionVariant = 'start' | 'end' | 'none'

const XRToggleButton = (props) => {
  const {
    labelPosition = 'start',
    labelContent,
    ...inputProps
  }: { labelPosition: labelPositionVariant; labelContent: any; inputProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      {labelPosition === 'start' && <span className="label left">{labelContent}</span>}
      <label className="switch">
        <input type="checkbox" {...inputProps} />
        <span className="switchSlider round"></span>
      </label>
      {labelPosition === 'end' && <span className="label right">{labelContent}</span>}
    </>
  )
}

export default XRToggleButton
