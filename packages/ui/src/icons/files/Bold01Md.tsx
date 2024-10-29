import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Bold01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6 10h6.667a3.333 3.333 0 0 0 0-6.667H6zm0 0h7.5a3.333 3.333 0 0 1 0 6.666H6z"
    />
  </svg>
)
const ForwardRef = forwardRef(Bold01Md)
export default ForwardRef
