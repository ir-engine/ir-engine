import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const StopCircleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      <path d="M10 18.334a8.333 8.333 0 1 0 0-16.667 8.333 8.333 0 0 0 0 16.667" />
      <path d="M6.666 8c0-.466 0-.7.09-.878a.83.83 0 0 1 .365-.364c.178-.091.412-.091.878-.091h4c.467 0 .7 0 .879.09.156.08.284.208.364.365.09.178.09.412.09.878v4c0 .467 0 .7-.09.879a.83.83 0 0 1-.364.364c-.179.09-.412.09-.879.09H8c-.466 0-.7 0-.878-.09a.83.83 0 0 1-.364-.364c-.091-.179-.091-.412-.091-.879z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(StopCircleMd)
export default ForwardRef
