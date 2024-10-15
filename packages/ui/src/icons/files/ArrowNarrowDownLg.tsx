import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ArrowNarrowDownLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m0 0 6-6m-6 6-6-6" />
  </svg>
)
const ForwardRef = forwardRef(ArrowNarrowDownLg)
export default ForwardRef
