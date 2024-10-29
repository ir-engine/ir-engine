import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SpwanPointSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M14.278 10.227a6.11 6.11 0 0 1-6.36.44M1.725 5.771a6.11 6.11 0 0 1 6.373-.431m2.153 4.075a6.11 6.11 0 0 0 2.818-5.742M5.722 6.602a6.11 6.11 0 0 0-2.789 5.723m7.419-5.567a6.11 6.11 0 0 0-3.563-5.31M5.65 9.283a6.12 6.12 0 0 0 3.561 5.269m3.503-11.266a6.667 6.667 0 1 1-9.428 9.428 6.667 6.667 0 0 1 9.428-9.428M9.886 6.114a2.667 2.667 0 1 1-3.77 3.771 2.667 2.667 0 0 1 3.77-3.77"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(SpwanPointSm)
export default ForwardRef
