import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SearchSmSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m14 14-4-4m1.333-3.333a4.667 4.667 0 1 1-9.333 0 4.667 4.667 0 0 1 9.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(SearchSmSm)
export default ForwardRef
