import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const AdminMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M3.125 5.238A9.97 9.97 0 0 0 10 2.5a9.97 9.97 0 0 0 7.002 2.737c.323.984.498 2.035.498 3.126 0 4.66-3.187 8.575-7.5 9.685-4.313-1.11-7.5-5.025-7.5-9.685a10 10 0 0 1 .498-3.126z"
    />
  </svg>
)
const ForwardRef = forwardRef(AdminMd)
export default ForwardRef
