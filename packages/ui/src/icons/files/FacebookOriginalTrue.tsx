import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FacebookOriginalTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="url(#prefix__a)"
      d="M21 41.8C12.5 40.3 6 32.9 6 24c0-9.9 8.1-18 18-18s18 8.1 18 18c0 8.9-6.5 16.3-15 17.8l-1-.8h-4z"
    />
    <path
      fill="#fff"
      d="m31 29 .8-5H27v-3.5c0-1.4.5-2.5 2.7-2.5H32v-4.6c-1.3-.2-2.7-.4-4-.4-4.1 0-7 2.5-7 7v4h-4.5v5H21v12.7q1.5.3 3 .3t3-.3V29z"
    />
    <defs>
      <linearGradient id="prefix__a" x1={24} x2={24} y1={40.754} y2={6} gradientUnits="userSpaceOnUse">
        <stop stopColor="#0062E0" />
        <stop offset={1} stopColor="#19AFFF" />
      </linearGradient>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(FacebookOriginalTrue)
export default ForwardRef
