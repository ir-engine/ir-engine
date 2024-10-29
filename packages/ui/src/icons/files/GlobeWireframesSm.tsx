import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GlobeWireframesSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 1.333C10 2.666 10.617 5.528 10.668 8c-.051 2.472-.666 5.333-2.666 6.666M8 1.333C6 2.666 5.385 5.528 5.334 8c.051 2.472.667 5.333 2.667 6.666M8 1.333A6.667 6.667 0 0 0 1.334 8m6.667-6.667A6.667 6.667 0 0 1 14.667 8m-6.666 6.666A6.667 6.667 0 0 0 14.667 8m-6.666 6.666A6.667 6.667 0 0 1 1.334 8m13.333 0c-1.333 2-4.194 2.615-6.666 2.666C5.529 10.615 2.667 10 1.334 8m13.333 0c-1.333-2-4.194-2.615-6.666-2.667C5.529 5.385 2.667 6 1.334 8"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(GlobeWireframesSm)
export default ForwardRef
