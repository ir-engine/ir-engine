import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SkipForwardLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M19 5v14M7.6 17.92l5.838-4.67c.534-.428.801-.641.898-.9a1 1 0 0 0 0-.7c-.097-.259-.364-.472-.898-.9L7.6 6.08C6.767 5.414 6.35 5.08 6 5.08a1 1 0 0 0-.783.377C5 5.73 5 6.263 5 7.329v9.342c0 1.066 0 1.599.218 1.872a1 1 0 0 0 .783.376c.35 0 .766-.333 1.599-.999"
    />
  </svg>
)
const ForwardRef = forwardRef(SkipForwardLg)
export default ForwardRef
