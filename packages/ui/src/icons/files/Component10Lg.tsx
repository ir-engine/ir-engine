import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Component10Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={12.139} r={2} fill="#080808" />
      <circle cx={12} cy={12.139} r={11} />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Component10Lg)
export default ForwardRef
