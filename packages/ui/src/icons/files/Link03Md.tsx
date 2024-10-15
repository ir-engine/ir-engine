import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Link03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8.333 10.833a4.168 4.168 0 0 0 6.284.45l2.5-2.5a4.167 4.167 0 0 0-5.892-5.892L9.792 4.316m1.875 4.85a4.166 4.166 0 0 0-6.284-.45l-2.5 2.5a4.167 4.167 0 0 0 5.892 5.892l1.425-1.425"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(Link03Md)
export default ForwardRef
