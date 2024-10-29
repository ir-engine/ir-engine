import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FacebookRoundedSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M0 16.1c0-5.695 0-8.542 1.126-10.71A10 10 0 0 1 5.39 1.126C7.558 0 10.405 0 16.1 0h15.8c5.695 0 8.542 0 10.71 1.126a10 10 0 0 1 4.264 4.264C48 7.558 48 10.405 48 16.1v15.8c0 5.695 0 8.542-1.126 10.71a10 10 0 0 1-4.264 4.264C40.442 48 37.595 48 31.9 48H16.1c-5.695 0-8.542 0-10.71-1.126a10 10 0 0 1-4.264-4.264C0 40.442 0 37.595 0 31.9z"
    />
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
const ForwardRef = forwardRef(FacebookRoundedSquareTrue)
export default ForwardRef
