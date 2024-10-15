import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const CheckLg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" ref={ref} {...props}>
    <path stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6 9 17l-5-5" />
  </svg>
)
const ForwardRef = forwardRef(CheckLg)
export default ForwardRef
