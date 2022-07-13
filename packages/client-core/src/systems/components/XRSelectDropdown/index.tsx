import React, { useState } from 'react'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import styleString from './index.scss'

const XRSelectDropdown = (props) => {
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
          <ArrowDropDownIcon />
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
