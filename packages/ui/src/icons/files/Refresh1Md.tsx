import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh1Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M1.667 11.667s.101.707 3.03 3.636a7.5 7.5 0 0 0 12.617-3.636m-15.647 0v5m0-5h5m11.667-3.334s-.101-.707-3.03-3.636A7.5 7.5 0 0 0 2.687 8.333m15.647 0v-5m0 5h-5"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh1Md)
export default ForwardRef
