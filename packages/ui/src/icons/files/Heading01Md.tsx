import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Heading01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6 3.333v13.333M16 3.333v13.333M7.668 3.333H4.334M16.001 10H6m1.666 6.666H4.334m13.333 0h-3.333m3.333-13.333h-3.333"
    />
  </svg>
)
const ForwardRef = forwardRef(Heading01Md)
export default ForwardRef
