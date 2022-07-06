import React from 'react'

import styleString from './index.scss'

const XRTextButton = (props) => {
  const { variant = 'filled', content, ...buttonProps } = props

  return (
    <>
      <style>{styleString}</style>
      <button {...buttonProps} className={`buttonContainer ${variant}`}>
        {content}
      </button>
    </>
  )
}

export default XRTextButton
