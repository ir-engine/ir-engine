import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ReportUserSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 10.333H5c-.93 0-1.395 0-1.773.115a2.67 2.67 0 0 0-1.778 1.778c-.115.378-.115.844-.115 1.774m10.667-4.667V12m0 2h.006m-2.34-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ReportUserSm)
export default ForwardRef
