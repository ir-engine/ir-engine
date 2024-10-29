import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Users02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M13.333 2.89a3.75 3.75 0 0 1 0 6.72m1.666 4.362c1.26.57 2.394 1.499 3.334 2.695m-16.667 0c1.622-2.065 3.824-3.334 6.25-3.334s4.628 1.27 6.25 3.334m-2.5-10.417a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Users02Md)
export default ForwardRef
