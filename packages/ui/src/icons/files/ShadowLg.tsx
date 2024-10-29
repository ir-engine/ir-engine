import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ShadowLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M22 12H12m10 0c0-1.821-.487-3.53-1.338-5M22 12c0 1.821-.487 3.53-1.338 5M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2m0 20v-5m0 5a10 10 0 0 0 8.662-5M12 2v5m0-5a10 10 0 0 1 8.662 5M12 12V7m0 5v5m0-10h8.662M12 17h8.662"
    />
  </svg>
)
const ForwardRef = forwardRef(ShadowLg)
export default ForwardRef
