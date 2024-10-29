import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SkipBackSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3.334 12.666V3.333m7.6.72L7.042 7.167c-.356.284-.534.427-.598.599a.67.67 0 0 0 0 .468c.064.172.242.314.598.599l3.892 3.114c.555.443.833.665 1.066.666a.67.67 0 0 0 .522-.251c.145-.183.145-.538.145-1.248V4.886c0-.71 0-1.066-.145-1.248A.67.67 0 0 0 12 3.387c-.233 0-.51.222-1.066.666"
    />
  </svg>
)
const ForwardRef = forwardRef(SkipBackSm)
export default ForwardRef
