import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Microphone01 = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M15.833 8.334V10a5.833 5.833 0 0 1-5.834 5.834m-5.833-7.5V10a5.833 5.833 0 0 0 5.833 5.834m0 0v2.5m-3.333 0h6.667M9.999 12.5A2.5 2.5 0 0 1 7.5 10V4.167a2.5 2.5 0 0 1 5 0V10a2.5 2.5 0 0 1-2.5 2.5"
    />
  </svg>
)
const ForwardRef = forwardRef(Microphone01)
export default ForwardRef
