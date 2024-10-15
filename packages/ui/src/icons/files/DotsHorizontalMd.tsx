import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const DotsHorizontalMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}>
      <path d="M10 10.834a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667M15.833 10.834a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667M4.166 10.834a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(DotsHorizontalMd)
export default ForwardRef
