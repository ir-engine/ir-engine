import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DotsVerticalMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M10 10.833a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667M10 5a.833.833 0 1 0 0-1.667A.833.833 0 0 0 10 5M10 16.666A.833.833 0 1 0 10 15a.833.833 0 0 0 0 1.666" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(DotsVerticalMd)
export default ForwardRef
