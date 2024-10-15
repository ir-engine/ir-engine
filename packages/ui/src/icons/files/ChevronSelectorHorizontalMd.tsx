import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronSelectorHorizontalMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7.5 5.833 3.333 10 7.5 14.166m5-8.333L16.666 10 12.5 14.166"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronSelectorHorizontalMd)
export default ForwardRef
