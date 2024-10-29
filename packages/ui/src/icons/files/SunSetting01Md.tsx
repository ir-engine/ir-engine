import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SunSetting01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 21"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M10 2.639v1.666M4.427 6.234 3.249 5.055m12.322 1.179 1.178-1.179M5 12.64a5 5 0 1 1 10 0m3.334 0H1.666m14.167 3.333H4.166"
    />
  </svg>
)
const ForwardRef = forwardRef(SunSetting01Md)
export default ForwardRef
