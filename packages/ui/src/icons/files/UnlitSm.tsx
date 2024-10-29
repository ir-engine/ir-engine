import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UnlitSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.167 8A5.167 5.167 0 1 1 2.834 8a5.167 5.167 0 0 1 10.333 0m1.5 0A6.667 6.667 0 1 1 1.334 8a6.667 6.667 0 0 1 13.333 0m-3.203 2a.75.75 0 0 0-1.299-.75 2.5 2.5 0 0 1-4.303.045.75.75 0 1 0-1.283.777A4 4 0 0 0 11.464 10"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(UnlitSm)
export default ForwardRef
