import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Refresh2Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14.667 6.667s-1.337-1.822-2.423-2.908a6 6 0 1 0 1.521 5.908m.902-3v-4m0 4h-4"
    />
  </svg>
)
const ForwardRef = forwardRef(Refresh2Sm)
export default ForwardRef
