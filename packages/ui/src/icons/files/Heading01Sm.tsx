import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Heading01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M5 2.667v10.667m8-10.667v10.667M6.332 2.667H3.666M12.999 8H5m1.334 5.334H3.666m10.667 0h-2.667m2.667-10.667h-2.667"
    />
  </svg>
)
const ForwardRef = forwardRef(Heading01Sm)
export default ForwardRef
