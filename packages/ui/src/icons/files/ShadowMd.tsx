import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ShadowMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M18.333 10H9.999m8.334 0c0-1.518-.406-2.94-1.115-4.166M18.333 10a8.3 8.3 0 0 1-1.115 4.167m-7.219 4.167a8.333 8.333 0 0 1 0-16.667m0 16.667v-4.167m0 4.167a8.33 8.33 0 0 0 7.219-4.167m-7.219-12.5v4.167m0-4.167a8.33 8.33 0 0 1 7.219 4.167M9.999 10V5.834M10 10v4.167m0-8.333h7.219m-7.219 8.333h7.219"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(ShadowMd)
export default ForwardRef
