import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PieChart03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 1.334A6.667 6.667 0 0 1 14.666 8M8 1.334V8m0-6.666A6.667 6.667 0 1 0 14.666 8M8 1.334A6.667 6.667 0 0 1 14.666 8m0 0H8m6.666 0a6.67 6.67 0 0 1-2.748 5.394L8 8"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PieChart03Sm)
export default ForwardRef
