import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SunSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 1.333v1.333m0 10.667v1.333M2.666 8H1.333m2.876-3.79-.943-.944m8.524.943.943-.943M4.21 11.793l-.943.943m8.524-.943.943.943M14.666 8h-1.333m-2 0a3.333 3.333 0 1 1-6.667 0 3.333 3.333 0 0 1 6.667 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(SunSm)
export default ForwardRef
