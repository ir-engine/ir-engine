import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UnitMeterSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 17 16"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#5F7DBF"
      d="M4.077 11.072v-6h1.068l.072 1.104v4.896zm4.152 0V8l1.14-.36v3.432zm4.152 0V8l1.128-.36v3.432zM8.229 8q0-.816-.192-1.236-.18-.432-.516-.6a1.7 1.7 0 0 0-.756-.18q-.732 0-1.14.516t-.408 1.452h-.492q0-.948.276-1.62.276-.684.792-1.044.528-.36 1.26-.36 1.08 0 1.692.672.624.66.624 2.04zm4.152 0q0-.816-.192-1.236-.192-.432-.516-.6a1.7 1.7 0 0 0-.756-.18q-.732 0-1.14.516t-.408 1.452h-.492q0-.948.276-1.62.276-.684.792-1.044.528-.36 1.26-.36 1.08 0 1.692.672.624.66.612 2.04z"
    />
  </svg>
)
const ForwardRef = forwardRef(UnitMeterSm)
export default ForwardRef
