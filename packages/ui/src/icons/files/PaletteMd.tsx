import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PaletteMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} clipPath="url(#prefix__a)">
      <path d="M2.666 10a8.333 8.333 0 0 0 8.333 8.334 2.5 2.5 0 0 0 2.5-2.5v-.417c0-.387 0-.58.022-.743a2.5 2.5 0 0 1 2.152-2.152c.162-.022.356-.022.743-.022h.417a2.5 2.5 0 0 0 2.5-2.5 8.333 8.333 0 0 0-16.667 0" />
      <path d="M6.833 10.834a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667M14.333 7.5a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666M9.333 6.667a.833.833 0 1 0 0-1.667.833.833 0 0 0 0 1.667" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PaletteMd)
export default ForwardRef
