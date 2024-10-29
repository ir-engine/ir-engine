import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TypeStrikethrough01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 24"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 7V6c0-.541.215-1.032.564-1.392M10 20h6m-3-8v8M4 3l18 18M10.5 4H18c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 5.602 21 6.068 21 7m-8-3v2.5"
    />
  </svg>
)
const ForwardRef = forwardRef(TypeStrikethrough01Lg)
export default ForwardRef
