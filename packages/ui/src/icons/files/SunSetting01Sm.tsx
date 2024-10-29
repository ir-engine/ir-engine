import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SunSetting01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 17"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8 2.139v1.333M3.544 5.015l-.942-.943m9.857.943.943-.943M4 10.139a4 4 0 1 1 8 0m2.666 0H1.334m11.333 2.666H3.334"
    />
  </svg>
)
const ForwardRef = forwardRef(SunSetting01Sm)
export default ForwardRef
