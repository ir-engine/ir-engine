import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TriangleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M1.992 15.082 8.846 3.243c.379-.654.568-.981.816-1.091a.83.83 0 0 1 .677 0c.247.11.436.437.815 1.091l6.854 11.84c.38.656.57.984.542 1.254a.83.83 0 0 1-.338.587c-.22.16-.599.16-1.358.16H3.146c-.759 0-1.138 0-1.357-.16a.83.83 0 0 1-.339-.587c-.028-.27.162-.598.542-1.255"
    />
  </svg>
)
const ForwardRef = forwardRef(TriangleMd)
export default ForwardRef
