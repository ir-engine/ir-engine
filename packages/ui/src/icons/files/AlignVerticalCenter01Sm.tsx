import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const AlignVerticalCenter01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M2 8h12M8 1.333v4.333m0 0L10.667 3M8 5.666 5.333 3M8 14.666v-4.333m0 0L10.667 13M8 10.333 5.333 13"
    />
  </svg>
)
const ForwardRef = forwardRef(AlignVerticalCenter01Sm)
export default ForwardRef
