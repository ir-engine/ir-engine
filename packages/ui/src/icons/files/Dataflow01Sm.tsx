import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Dataflow01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M11.333 13.333H11.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C8 11.813 8 11.253 8 10.133V5.866c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874c.428-.218.988-.218 2.108-.218h.133m0 10.667a1.333 1.333 0 1 0 2.667 0 1.333 1.333 0 0 0-2.667 0m0-10.667a1.333 1.333 0 1 0 2.667 0 1.333 1.333 0 0 0-2.667 0M4.667 8h6.666M4.667 8A1.333 1.333 0 1 1 2 8a1.333 1.333 0 0 1 2.667 0m6.666 0A1.333 1.333 0 1 0 14 8a1.333 1.333 0 0 0-2.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Dataflow01Sm)
export default ForwardRef
