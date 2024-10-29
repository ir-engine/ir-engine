import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Scissors02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m4 5.733 11 5.6m0-6.666-11 5.6M5 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4m0 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4"
    />
  </svg>
)
const ForwardRef = forwardRef(Scissors02Sm)
export default ForwardRef
