import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const TypeSquareSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M6.333 4.667h5.334M9 4.667v6.666M6.2 14h5.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C15 12.48 15 11.92 15 10.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C13.48 2 12.92 2 11.8 2H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 3.52 3 4.08 3 5.2v5.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 14 5.08 14 6.2 14"
    />
  </svg>
)
const ForwardRef = forwardRef(TypeSquareSm)
export default ForwardRef
