import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GridDotsRightMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6.25 2.5h.008M6.25 10h.008m-.008 7.5h.008m7.492-15h.008M13.75 10h.008m-.008 7.5h.008M10 2.5h.008M10 10h.008M10 17.5h.008M10 13.75h.008M10 6.25h.008M2.5 2.5h.008M2.5 10h.008M2.5 17.5h.008M2.5 13.75h.008M2.5 6.25h.008M17.5 17.5v-15"
    />
  </svg>
)
const ForwardRef = forwardRef(GridDotsRightMd)
export default ForwardRef
