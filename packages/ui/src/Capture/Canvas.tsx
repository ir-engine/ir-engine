import React, { forwardRef } from 'react'

const Canvas = (props, ref) => {
  return <canvas ref={ref} {...props} />
}

export default forwardRef(Canvas)
