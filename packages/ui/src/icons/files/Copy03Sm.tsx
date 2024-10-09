import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Copy03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5.333 5.333V3.466c0-.746 0-1.12.145-1.405.128-.25.332-.455.583-.583.285-.145.659-.145 1.405-.145h5.067c.747 0 1.12 0 1.405.145.251.128.455.332.583.583.145.285.145.659.145 1.405v5.067c0 .747 0 1.12-.145 1.405-.128.251-.332.455-.583.583-.285.145-.658.145-1.405.145h-1.867m-7.2 4h5.067c.747 0 1.12 0 1.405-.145.251-.128.455-.332.583-.583.145-.285.145-.658.145-1.405V7.466c0-.746 0-1.12-.145-1.405a1.33 1.33 0 0 0-.583-.583c-.285-.145-.658-.145-1.405-.145H3.466c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583-.145.285-.145.659-.145 1.405v5.067c0 .747 0 1.12.145 1.405.128.251.332.455.583.583.285.145.659.145 1.405.145"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Copy03Sm)
export default ForwardRef
