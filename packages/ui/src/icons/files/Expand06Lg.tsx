import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Expand06Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m16 8 5-5m0 0h-5m5 0v5M8 8 3 3m0 0v5m0-5h5m0 13-5 5m0 0h5m-5 0v-5m13 0 5 5m0 0v-5m0 5h-5"
    />
  </svg>
)
const ForwardRef = forwardRef(Expand06Lg)
export default ForwardRef
