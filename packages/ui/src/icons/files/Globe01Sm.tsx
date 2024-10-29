import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Globe01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M1.334 8h13.333M1.334 8a6.667 6.667 0 0 0 6.667 6.666M1.334 8a6.667 6.667 0 0 1 6.667-6.667M14.667 8a6.667 6.667 0 0 1-6.666 6.666M14.667 8a6.667 6.667 0 0 0-6.666-6.667m0 0A10.2 10.2 0 0 1 10.667 8a10.2 10.2 0 0 1-2.666 6.666M8 1.333A10.2 10.2 0 0 0 5.334 8a10.2 10.2 0 0 0 2.667 6.666"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Globe01Sm)
export default ForwardRef
