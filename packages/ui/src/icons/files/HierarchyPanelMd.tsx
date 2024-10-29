import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const HierarchyPanelMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10 3.334v9.333c0 1.4 0 2.1.273 2.635a2.5 2.5 0 0 0 1.092 1.093c.535.272 1.235.272 2.635.272h.167m0 0a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0M5.833 3.334h8.334m-8.334 0a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.333 0m8.334 0a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0M10 10h4.167m0 0a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(HierarchyPanelMd)
export default ForwardRef
