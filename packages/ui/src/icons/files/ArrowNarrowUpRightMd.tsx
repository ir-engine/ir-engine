import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ArrowNarrowUpRightMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M5 15 15 5m0 0H8.333M15 5v6.667"
    />
  </svg>
)
const ForwardRef = forwardRef(ArrowNarrowUpRightMd)
export default ForwardRef
