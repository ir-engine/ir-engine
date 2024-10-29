import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const NormalRenderSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#080808"
      fillRule="evenodd"
      d="M13.067 8A5.067 5.067 0 1 1 2.934 8a5.067 5.067 0 0 1 10.133 0m1.6 0A6.667 6.667 0 1 1 1.334 8a6.667 6.667 0 0 1 13.333 0M7.335 5.333a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333m-2 1.333a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333M8 7.333a.667.667 0 1 1-1.333 0 .667.667 0 0 1 1.333 0"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(NormalRenderSm)
export default ForwardRef
