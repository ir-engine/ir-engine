import React from 'react'

import styleString from './index.scss'

const XRInput = React.forwardRef((props: any, ref) => {
  const { border = true, startIcon, startIconClick, endIcon, endIconClick, ...inputProps } = props

  return (
    <>
      <style>{styleString}</style>
      <div className="inputBox">
        <div className="inputContainer">
          {startIcon && (
            <div className="startIconContainer" onClick={startIconClick}>
              {startIcon}
            </div>
          )}
          <input ref={ref} type="text" className="inputField" {...inputProps} />
          {endIcon && (
            <div className="endIconContainer" onClick={endIconClick}>
              {endIcon}
            </div>
          )}
          <fieldset aria-hidden="true" className={`linkFieldset ${!border ? 'noBorder' : ''}`}>
            <legend className="linkLegend" />
          </fieldset>
        </div>
      </div>
    </>
  )
})

export default XRInput
