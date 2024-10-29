import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ListMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M17.5 10h-10m10-5h-10m10 10h-10m-3.333-5A.833.833 0 1 1 2.5 10a.833.833 0 0 1 1.667 0m0-5A.833.833 0 1 1 2.5 5a.833.833 0 0 1 1.667 0m0 10A.833.833 0 1 1 2.5 15a.833.833 0 0 1 1.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ListMd)
export default ForwardRef
