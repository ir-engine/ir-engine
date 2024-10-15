import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LinkBroken02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <g clipPath="url(#prefix__a)">
      <path
        stroke="#080808"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="m7.084 12.917 5.833-5.833M7.5 3.334V1.667m5 15v1.667M3.334 7.5H1.667m15 5h1.667M4.096 4.096 2.917 2.917m12.988 12.988 1.179 1.179M10 14.714l-1.767 1.768a3.333 3.333 0 0 1-4.714-4.714L5.286 10m9.428 0 1.768-1.768a3.333 3.333 0 0 0-4.714-4.714L10 5.286"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(LinkBroken02Md)
export default ForwardRef
