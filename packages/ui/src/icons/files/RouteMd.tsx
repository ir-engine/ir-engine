import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const RouteMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M9.583 4.167h.362c2.54 0 3.809 0 4.29.456.417.394.602.975.49 1.537-.13.651-1.167 1.384-3.24 2.85l-3.388 2.396c-2.073 1.467-3.11 2.2-3.24 2.85a1.67 1.67 0 0 0 .49 1.538c.481.456 1.751.456 4.29.456h.779M6.666 4.167a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m11.667 11.667a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(RouteMd)
export default ForwardRef
