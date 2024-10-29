import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const LitLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      fill="#080808"
      fillRule="evenodd"
      d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10m5.196-7a1 1 0 0 0-1.732-1 4 4 0 0 1-6.885.072 1 1 0 1 0-1.711 1.036A6 6 0 0 0 17.196 15"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(LitLg)
export default ForwardRef
