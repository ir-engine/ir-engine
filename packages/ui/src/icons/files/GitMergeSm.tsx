import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const GitMergeSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0m0 0a6 6 0 0 1-6-6m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 0v8"
    />
  </svg>
)
const ForwardRef = forwardRef(GitMergeSm)
export default ForwardRef
