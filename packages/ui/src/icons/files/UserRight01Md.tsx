import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const UserRight01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
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
      d="m15.833 17.5 2.5-2.5m0 0-2.5-2.5m2.5 2.5h-5m-3.334-2.083H6.25c-1.163 0-1.744 0-2.217.143a3.33 3.33 0 0 0-2.222 2.222c-.144.473-.144 1.055-.144 2.218M12.083 6.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(UserRight01Md)
export default ForwardRef
