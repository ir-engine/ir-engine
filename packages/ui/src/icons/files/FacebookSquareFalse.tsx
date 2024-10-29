import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FacebookSquareFalse = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 48 48"
    role="img"
    stroke="currentColor"
    ref={ref}
    {...props}
  >
    <path
      fill="#080808"
      fillRule="evenodd"
      d="M48 0H0v48h48zM34.4 24l-1.067 6.667H28V48h-8V30.667h-6V24h6v-5.333c0-6 3.867-9.334 9.333-9.334 1.734 0 3.6.267 5.334.534V16H31.6c-2.933 0-3.6 1.467-3.6 3.333V24z"
      clipRule="evenodd"
    />
  </svg>
)
const ForwardRef = forwardRef(FacebookSquareFalse)
export default ForwardRef
