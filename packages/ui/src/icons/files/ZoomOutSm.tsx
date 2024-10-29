import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ZoomOutSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m14 14-2.9-2.9M5.333 7.333h4m3.334 0A5.333 5.333 0 1 1 2 7.333a5.333 5.333 0 0 1 10.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ZoomOutSm)
export default ForwardRef
