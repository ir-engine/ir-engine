import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PaletteLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
      <path d="M3 12c0 5.523 4.477 10 10 10a3 3 0 0 0 3-3v-.5c0-.464 0-.697.026-.892a3 3 0 0 1 2.582-2.582c.195-.026.428-.026.892-.026h.5a3 3 0 0 0 3-3c0-5.523-4.477-10-10-10S3 6.477 3 12" />
      <path d="M8 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2M17 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2M11 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(PaletteLg)
export default ForwardRef
