import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh2Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M22 10s-2.005-2.732-3.634-4.362a9 9 0 1 0 2.282 8.862M22 10V4m0 6h-6"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh2Lg)
export default ForwardRef
