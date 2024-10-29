import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SpwanPointMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M17.846 12.785a7.64 7.64 0 0 1-7.95.549M2.154 7.216a7.64 7.64 0 0 1 7.967-.54m2.69 5.095a7.64 7.64 0 0 0 3.524-7.177M7.15 8.254a7.64 7.64 0 0 0-3.486 7.153m9.273-6.96a7.64 7.64 0 0 0-4.454-6.636m-1.422 9.794a7.64 7.64 0 0 0 4.452 6.585m4.378-14.082A8.333 8.333 0 1 1 4.107 15.893 8.333 8.333 0 0 1 15.892 4.108m-3.536 3.535a3.333 3.333 0 1 1-4.714 4.714 3.333 3.333 0 0 1 4.714-4.714"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(SpwanPointMd)
export default ForwardRef
