import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PaperclipLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m21.154 10.899-9.016 9.016a5.25 5.25 0 0 1-7.425-7.425l9.016-9.016a3.5 3.5 0 1 1 4.95 4.95l-8.662 8.662a1.75 1.75 0 0 1-2.475-2.475l7.601-7.601"
    />
  </svg>
)
const ForwardRef = forwardRef(PaperclipLg)
export default ForwardRef
