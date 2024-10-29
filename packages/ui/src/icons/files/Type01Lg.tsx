import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Type01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M5 7c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C6.602 4 7.068 4 8 4h10c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 5.602 21 6.068 21 7M10 20h6M13 4v16"
    />
  </svg>
)
const ForwardRef = forwardRef(Type01Lg)
export default ForwardRef
