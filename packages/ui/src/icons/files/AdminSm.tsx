import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const AdminSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.5 4.19C4.63 4.19 6.566 3.359 8 2a7.97 7.97 0 0 0 5.601 2.19A8.003 8.003 0 0 1 8 14.439a8.003 8.003 0 0 1-5.601-10.25z"
    />
  </svg>
)
const ForwardRef = forwardRef(AdminSm)
export default ForwardRef
