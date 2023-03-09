import React, { useState } from 'react'

import Icon from '@etherealengine/ui/src/Icon'

import styleString from './index.scss?inline'

interface Props<T> {
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}

function XRSelectDropdown<T extends string>(props: Props<T>) {
  const { value, options, onChange } = props
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <>
      <style>{styleString}</style>
      <div className="selectContainer" onClick={toggleVisibility}>
        <div className="selectValue">{value}</div>
        <div className="selectIcon">
          <Icon type="ArrowDropDown" />
        </div>
        <div className={`selectOptions ${visible ? 'visible' : ''}`}>
          {options.map((op, index) => {
            return (
              <div
                key={index}
                className="selectOption"
                onClick={() => {
                  onChange(op)
                }}
              >
                {op}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default XRSelectDropdown
