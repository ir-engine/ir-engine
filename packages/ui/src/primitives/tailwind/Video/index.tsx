import React, { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

const Video = ({ className, ...props }, ref) => {
  return <video {...{ playsInline: true, autoplay: true }} className={twMerge(className)} ref={ref} {...props} />
}

export default forwardRef(Video)
