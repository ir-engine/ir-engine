import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const SunSetting01Lg = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 24 25"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 3.139v2M5.314 7.453 3.9 6.039m14.786 1.414L20.1 6.039M6 15.139a6 6 0 0 1 12 0m4 0H2m17 4H5"
    />
  </svg>
)
const ForwardRef = forwardRef(SunSetting01Lg)
export default ForwardRef
