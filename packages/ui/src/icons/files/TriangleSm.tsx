import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TriangleSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m1.594 12.066 5.483-9.471c.303-.524.455-.786.653-.873a.67.67 0 0 1 .541 0c.198.087.35.35.653.873l5.483 9.47c.304.526.456.789.434 1.004a.67.67 0 0 1-.271.47c-.176.128-.48.128-1.086.128H2.517c-.607 0-.91 0-1.086-.128a.67.67 0 0 1-.27-.47c-.023-.215.129-.478.433-1.003"
    />
  </svg>
)
const ForwardRef = forwardRef(TriangleSm)
export default ForwardRef
