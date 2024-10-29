import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CloudSkyboxMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7.916 15.833a6.25 6.25 0 1 1 5.534-9.157q.15-.01.3-.01a4.583 4.583 0 1 1 0 9.167z"
    />
  </svg>
)
const ForwardRef = forwardRef(CloudSkyboxMd)
export default ForwardRef
