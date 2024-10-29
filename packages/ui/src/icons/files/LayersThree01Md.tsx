import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LayersThree01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m1.667 10 8.035 4.018c.11.054.164.082.221.092q.077.015.154 0c.057-.01.112-.038.222-.092L18.334 10M1.667 14.167l8.035 4.017c.11.055.164.082.221.093q.077.015.154 0c.057-.01.112-.038.222-.093l8.035-4.017M1.667 5.833l8.035-4.017a1 1 0 0 1 .221-.093q.077-.015.154 0c.057.01.112.038.222.093l8.035 4.017-8.035 4.018c-.11.055-.165.082-.222.093a.4.4 0 0 1-.154 0c-.057-.011-.111-.038-.22-.093z"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LayersThree01Md)
export default ForwardRef
