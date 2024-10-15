import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronSelectorVerticalSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.667 10 8 13.334 11.334 10M4.667 6 8 2.667 11.334 6"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronSelectorVerticalSm)
export default ForwardRef
