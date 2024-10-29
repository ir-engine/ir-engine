import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const RouteSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M7.667 3.333h.29c2.031 0 3.047 0 3.433.365.333.315.48.78.39 1.23-.103.52-.933 1.107-2.591 2.28l-2.71 1.917c-1.658 1.173-2.488 1.76-2.592 2.28-.09.45.058.914.391 1.23C4.664 13 5.68 13 7.711 13h.623m-3-9.667a2 2 0 1 1-4 0 2 2 0 0 1 4 0m9.333 9.333a2 2 0 1 1-4 0 2 2 0 0 1 4 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(RouteSm)
export default ForwardRef
