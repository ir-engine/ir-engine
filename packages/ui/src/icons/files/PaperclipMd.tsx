import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PaperclipMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m17.628 9.082-7.513 7.514a4.375 4.375 0 0 1-6.187-6.188l7.513-7.513a2.917 2.917 0 0 1 4.125 4.125L8.347 14.24a1.458 1.458 0 0 1-2.062-2.063l6.334-6.334"
    />
  </svg>
)
const ForwardRef = forwardRef(PaperclipMd)
export default ForwardRef
