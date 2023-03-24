import React, { forwardRef } from 'react'

const Video = (props, ref) => {
  return <video className="w-full h-full -z-1 scale-x-[-1]" ref={ref} />
}

export default forwardRef(Video)
