import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ZoomInMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="m18.5 17.5-3.625-3.625m-4.708-7.208v5m-2.5-2.5h5m4.166 0a6.667 6.667 0 1 1-13.333 0 6.667 6.667 0 0 1 13.333 0"
    />
  </svg>
)
const ForwardRef = forwardRef(ZoomInMd)
export default ForwardRef
