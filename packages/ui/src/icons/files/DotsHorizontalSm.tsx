import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DotsHorizontalSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M8 8.666a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333M12.667 8.666a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333M3.334 8.666a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(DotsHorizontalSm)
export default ForwardRef
