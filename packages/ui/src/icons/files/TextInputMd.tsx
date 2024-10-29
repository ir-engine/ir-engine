import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TextInputMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M11.833 5.833h-6.5c-.934 0-1.4 0-1.757.182-.314.16-.569.415-.728.728-.182.357-.182.824-.182 1.757v3c0 .933 0 1.4.182 1.757.16.313.414.568.728.728.357.182.823.182 1.757.182h6.5m3.333-8.334h1.5c.933 0 1.4 0 1.757.182.313.16.568.415.728.728.182.357.182.824.182 1.757v3c0 .933 0 1.4-.182 1.757-.16.313-.415.568-.728.728-.357.182-.824.182-1.757.182h-1.5m0 3.333v-15m2.083 0h-4.166m4.166 15h-4.166"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(TextInputMd)
export default ForwardRef
