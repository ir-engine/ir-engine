import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const StopCircleSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} clipPath="url(#prefix__a)">
      <path d="M8 14.666A6.667 6.667 0 1 0 8 1.333a6.667 6.667 0 0 0 0 13.333" />
      <path d="M5.334 6.4c0-.374 0-.56.073-.703a.67.67 0 0 1 .291-.291c.143-.073.33-.073.703-.073h3.2c.373 0 .56 0 .702.073a.67.67 0 0 1 .292.291c.072.143.072.33.072.703v3.2c0 .373 0 .56-.072.702a.67.67 0 0 1-.292.292c-.142.072-.329.072-.702.072H6.4c-.374 0-.56 0-.703-.072a.67.67 0 0 1-.291-.292c-.073-.142-.073-.329-.073-.702z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(StopCircleSm)
export default ForwardRef
