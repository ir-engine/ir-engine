import React, { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const Canvas = ({ className, ...props }, ref) => {
  return <canvas className={twMerge(className)} ref={ref} {...props} />
}

export default forwardRef(Canvas)
