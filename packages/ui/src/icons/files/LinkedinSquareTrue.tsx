import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LinkedinSquareTrue = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path fill="#1265BF" d="M0 0h48v48H0z" />
    <g fill="#fff">
      <path d="M10.774 14.907a4.164 4.164 0 1 0 0-8.328 4.164 4.164 0 0 0 0 8.328M18.751 17.984h6.901v3.162S27.525 17.4 32.62 17.4c4.546 0 8.31 2.24 8.31 9.065v14.391h-7.15V28.208c0-4.026-2.15-4.468-3.788-4.468-3.4 0-3.981 2.932-3.981 4.994v12.122h-7.26zM7.144 17.984h7.26v22.872h-7.26z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(LinkedinSquareTrue)
export default ForwardRef
