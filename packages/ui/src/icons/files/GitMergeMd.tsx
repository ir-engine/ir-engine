import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GitMergeMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M12.5 15a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0m0 0A7.5 7.5 0 0 1 5 7.5m0 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5m0 0v10"
    />
  </svg>
)
const ForwardRef = forwardRef(GitMergeMd)
export default ForwardRef
