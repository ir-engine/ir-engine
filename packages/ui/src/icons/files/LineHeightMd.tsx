import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LineHeightMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M8.5 10.833h5m-6.667 3.334 3.56-7.832c.193-.424.29-.636.423-.702a.42.42 0 0 1 .368 0c.134.066.23.278.423.702l3.56 7.832M18.5 17.5h-15m15-15h-15"
    />
  </svg>
)
const ForwardRef = forwardRef(LineHeightMd)
export default ForwardRef
