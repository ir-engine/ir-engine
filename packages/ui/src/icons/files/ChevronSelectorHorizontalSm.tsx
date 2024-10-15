import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronSelectorHorizontalSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6 4.667 2.667 8 6 11.334m4-6.667L13.334 8 10 11.334"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronSelectorHorizontalSm)
export default ForwardRef
