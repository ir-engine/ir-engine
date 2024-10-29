import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Server02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4 5.334h.006M4 10.667h.006M4 8h8M4 8a2.667 2.667 0 0 1 0-5.333h8A2.667 2.667 0 0 1 12 8M4 8a2.667 2.667 0 0 0 0 5.334h8A2.667 2.667 0 0 0 12 8"
    />
  </svg>
)
const ForwardRef = forwardRef(Server02Sm)
export default ForwardRef
