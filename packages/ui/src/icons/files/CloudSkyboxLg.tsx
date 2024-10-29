import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CloudSkyboxLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M9.5 19a7.5 7.5 0 1 1 6.641-10.988Q16.319 8 16.5 8a5.5 5.5 0 1 1 0 11z"
    />
  </svg>
)
const ForwardRef = forwardRef(CloudSkyboxLg)
export default ForwardRef
