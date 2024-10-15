import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Edit01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M1.918 12.077c.03-.275.046-.413.087-.542q.056-.172.156-.324c.074-.113.172-.21.368-.407L11.334 2A1.886 1.886 0 1 1 14 4.667L5.196 13.47c-.196.196-.294.294-.407.369q-.152.1-.323.155c-.13.042-.267.057-.543.088l-2.256.25z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Edit01Sm)
export default ForwardRef
