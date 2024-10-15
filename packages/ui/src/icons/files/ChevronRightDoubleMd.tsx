import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronRightDoubleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M5 14.166 9.167 10 5 5.833m5.833 8.333L15 10l-4.167-4.167"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronRightDoubleMd)
export default ForwardRef
