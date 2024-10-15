import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh2Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M18.333 8.333s-1.67-2.276-3.028-3.634a7.5 7.5 0 1 0 1.902 7.385m1.126-3.75v-5m0 5h-5"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh2Md)
export default ForwardRef
