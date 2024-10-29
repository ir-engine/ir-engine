import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Globe01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
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
        strokeWidth={1.75}
        d="M1.666 10h16.667M1.666 10a8.333 8.333 0 0 0 8.333 8.334M1.666 10a8.333 8.333 0 0 1 8.333-8.333M18.333 10a8.333 8.333 0 0 1-8.334 8.334M18.333 10a8.333 8.333 0 0 0-8.334-8.333m0 0A12.75 12.75 0 0 1 13.333 10a12.75 12.75 0 0 1-3.334 8.334m0-16.667A12.75 12.75 0 0 0 6.666 10a12.75 12.75 0 0 0 3.333 8.334"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Globe01Md)
export default ForwardRef
