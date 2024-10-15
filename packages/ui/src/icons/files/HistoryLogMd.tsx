import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const HistoryLogMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 20 20" ref={ref} {...props}>
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="m7.154 11.26-1.437 4.5-4.503-1.424"
    />
    <path stroke="#000" strokeLinecap="round" strokeWidth={1.75} d="M10.732 17.333a7.302 7.302 0 1 0-5.303-2.282" />
    <path
      fill="#000"
      d="M11.106 7.031a.875.875 0 0 0-1.75 0zm-.876 3.474h-.875v.48l.406.258zm2.715 2.764a.875.875 0 1 0 .94-1.476zm-3.59-6.238v3.474h1.75V7.03zm.406 4.212 3.184 2.026.94-1.476L10.7 9.766z"
    />
  </svg>
)
const ForwardRef = forwardRef(HistoryLogMd)
export default ForwardRef
