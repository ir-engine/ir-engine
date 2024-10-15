import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Expand01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.333 6.667 14 2m0 0h-4m4 0v4M6.667 9.333 2 14m0 0h4m-4 0v-4"
    />
  </svg>
)
const ForwardRef = forwardRef(Expand01Sm)
export default ForwardRef
