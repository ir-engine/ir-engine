import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Trash04Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <path
      stroke="#080808"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6 2h4M2 4h12m-1.333 0-.468 7.013c-.07 1.052-.105 1.578-.332 1.977a2 2 0 0 1-.866.81c-.413.2-.94.2-1.995.2H6.994c-1.055 0-1.582 0-1.995-.2a2 2 0 0 1-.866-.81c-.227-.399-.262-.925-.332-1.977L3.333 4"
    />
  </svg>
)
const ForwardRef = forwardRef(Trash04Sm)
export default ForwardRef
