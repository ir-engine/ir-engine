import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const RefreshCcw05Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.698 13.317a5.667 5.667 0 0 0 7.21-8.012l-.167-.289m-9.649 5.956a5.667 5.667 0 0 1 7.21-8.012m-8.64 8.067 1.821.488.489-1.82m8.056-3.113.488-1.821 1.822.488"
    />
  </svg>
)
const ForwardRef = forwardRef(RefreshCcw05Sm)
export default ForwardRef
