import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SnappingToolSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M5.333 2h-1.2c-.746 0-1.12 0-1.405.145-.25.128-.455.332-.583.583C2 3.013 2 3.387 2 4.133v1.2M5.333 14h-1.2c-.746 0-1.12 0-1.405-.145a1.33 1.33 0 0 1-.583-.583C2 12.987 2 12.613 2 11.867v-1.2m12-5.334v-1.2c0-.746 0-1.12-.145-1.405a1.33 1.33 0 0 0-.583-.583C12.987 2 12.613 2 11.867 2h-1.2M14 10.667v1.2c0 .746 0 1.12-.145 1.405-.128.25-.332.455-.583.583-.285.145-.659.145-1.405.145h-1.2m0-6a2.667 2.667 0 1 1-5.334 0 2.667 2.667 0 0 1 5.334 0"
    />
  </svg>
)
const ForwardRef = forwardRef(SnappingToolSm)
export default ForwardRef
