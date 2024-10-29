import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const AlignVerticalCenter01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M2.5 10h15M10 1.667v5.417m0 0 3.333-3.334M10 7.084 6.667 3.75M10 18.334v-5.417m0 0 3.333 3.333M10 12.917 6.667 16.25"
    />
  </svg>
)
const ForwardRef = forwardRef(AlignVerticalCenter01Md)
export default ForwardRef
