import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Expand01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M11.667 8.333 17.5 2.5m0 0h-5m5 0v5m-9.167 4.167L2.5 17.5m0 0h5m-5 0v-5"
    />
  </svg>
)
const ForwardRef = forwardRef(Expand01Md)
export default ForwardRef
