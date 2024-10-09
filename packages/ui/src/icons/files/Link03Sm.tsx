import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Link03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M6.667 8.667a3.333 3.333 0 0 0 5.026.36l2-2A3.333 3.333 0 0 0 8.98 2.314l-1.147 1.14m1.5 3.88a3.333 3.333 0 0 0-5.026-.36l-2 2a3.333 3.333 0 0 0 4.713 4.713l1.14-1.14"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Link03Sm)
export default ForwardRef
