import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ArrowTopRightOnSquareMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M11.25 5H4.375A1.875 1.875 0 0 0 2.5 6.875v8.75A1.875 1.875 0 0 0 4.375 17.5h8.75A1.875 1.875 0 0 0 15 15.625V8.75m-8.75 5L17.5 2.5m0 0h-4.375m4.375 0v4.375"
    />
  </svg>
)
const ForwardRef = forwardRef(ArrowTopRightOnSquareMd)
export default ForwardRef
