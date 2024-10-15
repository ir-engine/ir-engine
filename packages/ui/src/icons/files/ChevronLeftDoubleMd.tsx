import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronLeftDoubleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M15 14.166 10.833 10 15 5.833m-5.833 8.333L5 10l4.167-4.167"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronLeftDoubleMd)
export default ForwardRef
