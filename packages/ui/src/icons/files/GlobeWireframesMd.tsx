import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GlobeWireframesMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M10 1.667C12.5 3.334 13.267 6.91 13.332 10c-.065 3.09-.834 6.667-3.334 8.334m0-16.667C7.5 3.334 6.73 6.91 6.666 10c.064 3.09.833 6.667 3.333 8.334m0-16.667A8.333 8.333 0 0 0 1.666 10m8.333-8.333A8.333 8.333 0 0 1 18.333 10m-8.334 8.334A8.333 8.333 0 0 0 18.333 10m-8.334 8.334A8.333 8.333 0 0 1 1.666 10m16.667 0c-1.667 2.5-5.244 3.27-8.334 3.334C6.91 13.269 3.333 12.5 1.666 10m16.667 0c-1.667-2.5-5.244-3.269-8.334-3.333C6.91 6.731 3.333 7.5 1.666 10"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(GlobeWireframesMd)
export default ForwardRef
