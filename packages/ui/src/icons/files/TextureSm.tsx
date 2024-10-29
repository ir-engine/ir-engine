import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TextureSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M1.334 4c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667M1.334 12c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667M1.334 8c.4.333.8.666 1.667.666 1.666 0 1.666-1.333 3.333-1.333.867 0 1.267.333 1.667.667.4.333.8.666 1.666.666 1.667 0 1.667-1.333 3.334-1.333.866 0 1.266.333 1.666.667"
    />
  </svg>
)
const ForwardRef = forwardRef(TextureSm)
export default ForwardRef
