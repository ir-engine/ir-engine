import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh1Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1.333 9.333s.08.566 2.424 2.91a6 6 0 0 0 10.093-2.91m-12.517 0v4m0-4h4m9.333-2.666s-.08-.566-2.424-2.91A6 6 0 0 0 2.15 6.667m12.517 0v-4m0 4h-4"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh1Sm)
export default ForwardRef
