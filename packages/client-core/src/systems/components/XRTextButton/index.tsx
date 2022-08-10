import React from 'react'

import styleString from './index.scss'

type textButtonVariant = 'filled' | 'outlined' | 'gradient'

const XRTextButton = (props) => {
  const {
    variant = 'filled',
    className,
    children,
    ...buttonProps
  }: { variant: textButtonVariant; className: any; content: any; children: React.ReactNode; buttonProps: any } = props

  return (
    <>
      <style>{styleString}</style>
      <button {...buttonProps} className={`buttonContainer ${className} ${variant}`}>
        {children}
      </button>
    </>
  )
}

export default XRTextButton
