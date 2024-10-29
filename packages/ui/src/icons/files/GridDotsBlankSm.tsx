import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GridDotsBlankSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M2 2h.007M2 8h.007M2 14h.007M2 11h.007M2 5h.007M5 2h.007M5 8h.007M5 14h.007M11 2h.007M11 8h.007M11 14h.007M8 2h.007M8 8h.007M8 14h.007M8 11h.007M8 5h.007M14 2h.007M14 8h.007M14 14h.007M14 11h.007M14 5h.007"
    />
  </svg>
)
const ForwardRef = forwardRef(GridDotsBlankSm)
export default ForwardRef
