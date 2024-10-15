import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ChevronLeftMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="m12.5 15-5-5 5-5" />
  </svg>
)
const ForwardRef = forwardRef(ChevronLeftMd)
export default ForwardRef
