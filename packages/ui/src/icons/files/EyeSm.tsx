import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EyeSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 16 16" ref={ref} {...props}>
    <g stroke="#080808" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M1.613 8.476c-.09-.144-.136-.216-.161-.327a.8.8 0 0 1 0-.298c.025-.11.07-.183.161-.326C2.363 6.337 4.597 3.334 8 3.334c3.404 0 5.637 3.003 6.387 4.19.09.144.136.216.162.327.019.083.019.215 0 .298-.026.111-.071.183-.162.327-.75 1.188-2.983 4.19-6.387 4.19s-5.636-3.002-6.387-4.19" />
      <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(EyeSm)
export default ForwardRef
