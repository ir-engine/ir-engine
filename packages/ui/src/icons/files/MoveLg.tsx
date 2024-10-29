import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MoveLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m6 9-3 3m0 0 3 3m-3-3h20M10 5l3-3m0 0 3 3m-3-3v20m3-3-3 3m0 0-3-3M20 9l3 3m0 0-3 3"
    />
  </svg>
)
const ForwardRef = forwardRef(MoveLg)
export default ForwardRef
