import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TextInputLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M14 7H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 8.52 3 9.08 3 10.2v3.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 17 5.08 17 6.2 17H14m4-10h1.8c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C23 8.52 23 9.08 23 10.2v3.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C21.48 17 20.92 17 19.8 17H18m0 4V3m2.5 0h-5m5 18h-5"
    />
  </svg>
)
const ForwardRef = forwardRef(TextInputLg)
export default ForwardRef
