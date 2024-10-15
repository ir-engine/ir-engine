import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LinkBroken02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m5.666 10.333 4.667-4.667M6 2.666V1.333m4 12v1.333M2.666 6H1.333m12 4h1.333M3.276 3.276l-.943-.943m10.39 10.39.943.943M8 11.771l-1.415 1.414a2.667 2.667 0 1 1-3.77-3.771L4.227 8m7.543 0 1.414-1.415a2.667 2.667 0 0 0-3.771-3.77L8 4.227"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LinkBroken02Sm)
export default ForwardRef
