import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TriangleLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m2.39 18.099 8.225-14.207c.455-.785.682-1.178.979-1.31a1 1 0 0 1 .812 0c.297.132.524.525.978 1.31l8.225 14.207c.456.788.685 1.182.65 1.505a1 1 0 0 1-.406.705c-.263.191-.718.191-1.628.191H3.775c-.91 0-1.366 0-1.629-.191a1 1 0 0 1-.406-.705c-.034-.323.194-.717.65-1.505"
    />
  </svg>
)
const ForwardRef = forwardRef(TriangleLg)
export default ForwardRef
