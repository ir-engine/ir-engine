import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronDownDoubleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M5.833 10.833 10 15l4.166-4.167M5.833 5 10 9.167 14.166 5"
    />
  </svg>
)
const ForwardRef = forwardRef(ChevronDownDoubleMd)
export default ForwardRef
