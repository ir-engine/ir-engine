import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TypeStrikethrough01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3.667 4.667V4c0-.36.143-.688.376-.928M7 13.333h4M9 8v5.333M3 2l12 12M7.333 2.667h5c.622 0 .932 0 1.177.101.327.135.587.395.722.722.101.245.101.555.101 1.177M9 2.667v1.666"
    />
  </svg>
)
const ForwardRef = forwardRef(TypeStrikethrough01Sm)
export default ForwardRef
