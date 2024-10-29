import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Image01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M10.8 14H4.62c-.403 0-.605 0-.698-.08a.33.33 0 0 1-.116-.28c.01-.122.152-.265.438-.55l5.668-5.67c.264-.263.396-.395.549-.445a.67.67 0 0 1 .412 0c.152.05.284.182.548.446L14 10v.8M10.8 14c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C14 12.48 14 11.92 14 10.8M10.8 14H5.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C2 12.48 2 11.92 2 10.8V5.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C3.52 2 4.08 2 5.2 2h5.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C14 3.52 14 4.08 14 5.2v5.6M7 5.667a1.333 1.333 0 1 1-2.667 0 1.333 1.333 0 0 1 2.667 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Image01Sm)
export default ForwardRef
