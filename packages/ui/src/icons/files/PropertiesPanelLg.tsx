import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PropertiesPanelLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3 8h12m0 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0m-6 8h12M9 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
    />
  </svg>
)
const ForwardRef = forwardRef(PropertiesPanelLg)
export default ForwardRef
