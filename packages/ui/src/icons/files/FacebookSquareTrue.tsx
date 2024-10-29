import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FacebookSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path fill="url(#prefix__a)" d="M0 0h48v48H0z" />
    <path
      fill="#fff"
      d="M33.333 30.666 34.4 24H28v-4.667c0-1.867.667-3.333 3.6-3.333h3.067V9.866c-1.734-.266-3.6-.533-5.334-.533-5.466 0-9.333 3.333-9.333 9.333V24h-6v6.666h6V48h8V30.666z"
    />
    <defs>
      <linearGradient id="prefix__a" x1={24} x2={24} y1={46.597} y2={0} gradientUnits="userSpaceOnUse">
        <stop stopColor="#0062E0" />
        <stop offset={1} stopColor="#19AFFF" />
      </linearGradient>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(FacebookSquareTrue)
export default ForwardRef
