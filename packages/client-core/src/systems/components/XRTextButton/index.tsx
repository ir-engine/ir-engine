import React from 'react'

import styleString from './index.scss'

type textButtonVariant = 'filled' | 'outlined' | 'gradient'

const XRTextButton = (props) => {
  const {
    variant = 'filled',
    content,
    className,
    ...buttonProps
  }: { variant: textButtonVariant; className: any; content: any; buttonProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      <button {...buttonProps} className={`buttonContainer ${className} ${variant}`}>
        {content}
      </button>
    </>
  )
}

export default XRTextButton
