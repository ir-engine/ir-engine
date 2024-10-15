import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PieChart03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M10 1.667A8.334 8.334 0 0 1 18.334 10M10 1.667V10m0-8.333A8.333 8.333 0 1 0 18.334 10M10 1.667A8.333 8.333 0 0 1 18.334 10m0 0H10m8.334 0a8.33 8.33 0 0 1-3.435 6.742L10 10"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PieChart03Md)
export default ForwardRef
