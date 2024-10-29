import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Server02Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M5 6.666h.009M5 13.333h.009M5 10h10M5 10a3.333 3.333 0 1 1 0-6.667h10A3.333 3.333 0 1 1 15 10M5 10a3.333 3.333 0 0 0 0 6.666h10A3.333 3.333 0 1 0 15 10"
    />
  </svg>
)
const ForwardRef = forwardRef(Server02Md)
export default ForwardRef
