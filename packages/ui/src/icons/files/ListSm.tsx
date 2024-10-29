import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ListSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14 8H6m8-4H6m8 8H6M3.333 8A.667.667 0 1 1 2 8a.667.667 0 0 1 1.333 0m0-4A.667.667 0 1 1 2 4a.667.667 0 0 1 1.333 0m0 8A.667.667 0 1 1 2 12a.667.667 0 0 1 1.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ListSm)
export default ForwardRef
