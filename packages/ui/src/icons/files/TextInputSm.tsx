import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TextInputSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M9.667 4.667h-5.2c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583-.145.285-.145.658-.145 1.405v2.4c0 .747 0 1.12.145 1.405.128.251.332.455.583.583.285.145.659.145 1.405.145h5.2m2.667-6.666h1.2c.747 0 1.12 0 1.405.145.251.128.455.332.583.583.145.285.145.658.145 1.405v2.4c0 .747 0 1.12-.145 1.405-.128.251-.332.455-.583.583-.285.145-.658.145-1.405.145h-1.2m0 2.667V2m1.667 0h-3.334m3.334 12h-3.334"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(TextInputSm)
export default ForwardRef
