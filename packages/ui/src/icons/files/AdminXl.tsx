import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const AdminXl = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.75 6.286c3.196 0 6.1-1.25 8.25-3.286a11.96 11.96 0 0 0 8.402 3.285 12 12 0 0 1 .598 3.75c0 5.592-3.824 10.29-9 11.623-5.176-1.332-9-6.03-9-11.622 0-1.31.21-2.571.598-3.751z"
    />
  </svg>
)
const ForwardRef = forwardRef(AdminXl)
export default ForwardRef
