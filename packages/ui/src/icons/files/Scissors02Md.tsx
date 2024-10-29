import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Scissors02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m4.75 7.167 13.75 7m0-8.334-13.75 7M6 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5m0 10a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5"
    />
  </svg>
)
const ForwardRef = forwardRef(Scissors02Md)
export default ForwardRef
