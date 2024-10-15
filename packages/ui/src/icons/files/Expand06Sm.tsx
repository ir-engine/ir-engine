import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Expand06Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.667 5.333 14 2m0 0h-3.333M14 2v3.333m-8.667 0L2 2m0 0v3.333M2 2h3.333m0 8.667L2 14m0 0h3.333M2 14v-3.333m8.667 0L14 14m0 0v-3.333M14 14h-3.333"
    />
  </svg>
)
const ForwardRef = forwardRef(Expand06Sm)
export default ForwardRef
