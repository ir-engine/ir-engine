import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MouseLeftClickDefault = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M8 1.333A4.667 4.667 0 0 0 3.332 6v4a4.667 4.667 0 0 0 9.333 0V6M7.999 1.333A4.667 4.667 0 0 1 12.666 6M7.999 1.333V6h4.667"
    />
    <path fill="#080808" d="M8.334 5.666V1.333s1.785.431 2.667 1c1.178.76 1.333 3.333 1.333 3.333z" />
  </svg>
)
const ForwardRef = forwardRef(MouseLeftClickDefault)
export default ForwardRef
