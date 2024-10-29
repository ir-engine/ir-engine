import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const RefreshCcw05Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7.122 16.612a7.083 7.083 0 0 0 9.012-10.015l-.207-.36M3.866 13.68a7.083 7.083 0 0 1 9.012-10.015m-10.8 10.085 2.277.61.61-2.277m10.07-3.89.61-2.277 2.278.61"
    />
  </svg>
)
const ForwardRef = forwardRef(RefreshCcw05Md)
export default ForwardRef
