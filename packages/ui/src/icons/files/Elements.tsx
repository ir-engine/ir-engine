import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Elements = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6.34 3.111a1.333 1.333 0 1 1 .994 2.222h-6m7.005 7.556a1.333 1.333 0 1 0 .994-2.222h-8m9.843-6A2 2 0 1 1 12.666 8H1.334"
    />
  </svg>
)
const ForwardRef = forwardRef(Elements)
export default ForwardRef
