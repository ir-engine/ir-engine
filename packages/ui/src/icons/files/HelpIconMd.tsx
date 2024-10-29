import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const HelpIconMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7.672 7.6a2.4 2.4 0 0 1 4.664.8c0 1.6-2.4 2.4-2.4 2.4M10 14h.008M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"
    />
  </svg>
)
const ForwardRef = forwardRef(HelpIconMd)
export default ForwardRef
