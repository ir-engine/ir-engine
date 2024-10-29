import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Microphone01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.667 6.666V8a4.667 4.667 0 0 1-4.666 4.666m-4.667-6V8a4.667 4.667 0 0 0 4.667 4.666m0 0v2m-2.667 0h5.333M8.001 10a2 2 0 0 1-2-2V3.333a2 2 0 1 1 4 0V8a2 2 0 0 1-2 2"
    />
  </svg>
)
const ForwardRef = forwardRef(Microphone01Sm)
export default ForwardRef
