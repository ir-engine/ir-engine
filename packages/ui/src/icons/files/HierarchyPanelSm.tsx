import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const HierarchyPanelSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M8 2.666v7.467c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874c.428.218.988.218 2.108.218h.133m0 0a1.333 1.333 0 1 0 2.667 0 1.333 1.333 0 0 0-2.667 0M4.667 2.666h6.666m-6.666 0a1.333 1.333 0 1 1-2.667 0 1.333 1.333 0 0 1 2.667 0m6.666 0a1.333 1.333 0 1 0 2.667 0 1.333 1.333 0 0 0-2.667 0M8 8h3.333m0 0A1.333 1.333 0 1 0 14 8a1.333 1.333 0 0 0-2.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(HierarchyPanelSm)
export default ForwardRef
