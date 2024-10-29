import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UnlitMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#080808"
      fillRule="evenodd"
      d="M16.583 10a6.583 6.583 0 1 1-13.167 0 6.583 6.583 0 0 1 13.167 0m1.75 0a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0m-4.003 2.5a.875.875 0 1 0-1.515-.875 3.25 3.25 0 0 1-5.595.059.875.875 0 1 0-1.497.906 5 5 0 0 0 8.607-.09"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(UnlitMd)
export default ForwardRef
