import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const User01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.333 14c0-.93 0-1.396-.115-1.774a2.67 2.67 0 0 0-1.778-1.778c-.378-.115-.844-.115-1.774-.115H6.333c-.93 0-1.396 0-1.774.115a2.67 2.67 0 0 0-1.778 1.778c-.115.378-.115.844-.115 1.774m8.333-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0"
    />
  </svg>
)
const ForwardRef = forwardRef(User01Sm)
export default ForwardRef
