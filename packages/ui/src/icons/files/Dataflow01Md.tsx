import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Dataflow01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M14.167 16.667H14c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.092-1.092C10 14.767 10 14.067 10 12.667V7.334c0-1.4 0-2.1.273-2.635a2.5 2.5 0 0 1 1.092-1.093C11.9 3.334 12.6 3.334 14 3.334h.167m0 13.333a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0m0-13.333a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0M5.833 10h8.334m-8.334 0A1.667 1.667 0 1 1 2.5 10a1.667 1.667 0 0 1 3.333 0m8.334 0a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Dataflow01Md)
export default ForwardRef
