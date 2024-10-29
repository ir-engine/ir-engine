import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PaperclipSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m14.103 7.266-6.01 6.01a3.5 3.5 0 0 1-4.95-4.95l6.01-6.01a2.333 2.333 0 0 1 3.3 3.3l-5.775 5.775a1.167 1.167 0 0 1-1.65-1.65l5.068-5.068"
    />
  </svg>
)
const ForwardRef = forwardRef(PaperclipSm)
export default ForwardRef
