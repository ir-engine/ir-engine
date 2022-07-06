import React from 'react'

import styleString from './index.scss'

type uploadButtonVariant = 'filled' | 'outlined' | 'gradient'

const XRUploadButton = (props) => {
  const {
    variant = 'filled',
    buttonContent,
    ...inputProps
  }: { variant: uploadButtonVariant; buttonContent: any; inputProps: any } = props

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
