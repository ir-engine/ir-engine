import React from 'react'

import styleString from './index.scss'

const XRUploadButton = (props) => {
  const { variant = 'filled', buttonContent, ...inputProps } = props

  return (
    <>
      <style>{styleString}</style>
      <label htmlFor="upload-button">
        <input id="upload-button" {...inputProps} className="uploadInput" />
        <button className={`buttonContainer ${variant}`}>{buttonContent}</button>
      </label>
    </>
  )
}

export default XRUploadButton
