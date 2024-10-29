import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UserDown01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10 12.917H6.25c-1.164 0-1.745 0-2.218.143a3.33 3.33 0 0 0-2.222 2.222c-.144.473-.144 1.055-.144 2.218M13.333 15l2.5 2.5m0 0 2.5-2.5m-2.5 2.5v-5m-3.75-6.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(UserDown01Md)
export default ForwardRef
