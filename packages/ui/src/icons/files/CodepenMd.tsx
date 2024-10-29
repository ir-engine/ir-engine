import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CodepenMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="m10 7.5-6.613 4.299c-.573.372-.86.559-.96.795a.83.83 0 0 0 0 .645M10 7.5l6.614 4.3c.573.372.86.559.959.795a.83.83 0 0 1 0 .645M10 7.5V2.084M10 12.5 3.387 8.2c-.573-.372-.86-.559-.96-.795a.83.83 0 0 1 0-.646M10 12.5 16.614 8.2c.573-.372.86-.559.959-.795a.83.83 0 0 0 0-.646M10 12.5v5.417m7.727-4.606-7 4.55c-.263.17-.395.256-.536.29a.8.8 0 0 1-.381 0c-.142-.034-.273-.12-.536-.29l-7-4.55c-.222-.144-.333-.216-.413-.312a.8.8 0 0 1-.157-.29c-.037-.12-.037-.252-.037-.516V7.807c0-.265 0-.397.037-.516A.8.8 0 0 1 1.86 7c.08-.096.191-.168.413-.312l7-4.55c.263-.171.394-.257.536-.29a.8.8 0 0 1 .38 0c.142.033.274.119.537.29l7 4.55c.222.144.332.216.413.312a.8.8 0 0 1 .157.29c.037.12.037.251.037.516v4.386c0 .264 0 .397-.037.516a.8.8 0 0 1-.157.29c-.08.096-.191.168-.413.312"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(CodepenMd)
export default ForwardRef
