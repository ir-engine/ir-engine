import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Component10Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 21"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <g stroke="currentColor" strokeWidth={1.75}>
      <circle cx={10} cy={10.139} r={1.625} fill="#080808" />
      <circle cx={10} cy={10.139} r={9.125} />
    </g>
  </svg>
)
const ForwardRef = forwardRef(Component10Md)
export default ForwardRef
