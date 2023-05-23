import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import styleString from './index.scss?inline'

type labelPositionVariant = 'start' | 'end' | 'none'

const XRCheckboxButton = (props) => {
  const {
    labelPosition = 'end',
    labelContent,
    checked,
    ...inputProps
  }: { labelPosition: labelPositionVariant; labelContent: any; checked: boolean; inputProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      <div className="checkboxContainer">
        {labelPosition === 'start' && <span className="label left">{labelContent}</span>}
        <label className="checkbox">
          <input type="checkbox" checked={checked} {...inputProps} />
          {checked && (
            <span className="checkboxIcon">
              <Icon type="Check" />
            </span>
          )}
        </label>
        {labelPosition === 'end' && <span className="label right">{labelContent}</span>}
      </div>
    </>
  )
}

export default XRCheckboxButton
