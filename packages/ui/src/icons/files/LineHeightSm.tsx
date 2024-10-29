import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LineHeightSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7 8.667h4m-5.333 2.666 2.847-6.265c.155-.34.232-.509.339-.561a.33.33 0 0 1 .294 0c.107.052.184.222.339.561l2.847 6.265M15 14H3M15 2H3"
    />
  </svg>
)
const ForwardRef = forwardRef(LineHeightSm)
export default ForwardRef
