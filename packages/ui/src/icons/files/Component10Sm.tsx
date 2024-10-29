import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Component10Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g stroke="currentColor" strokeWidth={1.5}>
      <circle cx={8} cy={8.139} r={1.25} fill="#080808" />
      <circle cx={8} cy={8.139} r={7.25} />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Component10Sm)
export default ForwardRef
