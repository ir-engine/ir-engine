import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UploadCloud02Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.333 10.667 8 8m0 0 2.666 2.667M8 8v6m5.333-2.838A3.667 3.667 0 0 0 11 4.667a.41.41 0 0 1-.356-.202A5 5 0 1 0 2.79 10.53"
    />
  </svg>
)
const ForwardRef = forwardRef(UploadCloud02Sm)
export default ForwardRef
