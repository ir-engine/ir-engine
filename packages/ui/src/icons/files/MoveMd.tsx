import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MoveMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m5.166 7.5-2.5 2.5m0 0 2.5 2.5m-2.5-2.5h16.667M8.499 4.167l2.5-2.5m0 0 2.5 2.5m-2.5-2.5v16.667m2.5-2.5-2.5 2.5m0 0-2.5-2.5M16.833 7.5l2.5 2.5m0 0-2.5 2.5"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(MoveMd)
export default ForwardRef
