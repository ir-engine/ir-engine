import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EllipsisVertical = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(EllipsisVertical)
export default ForwardRef
