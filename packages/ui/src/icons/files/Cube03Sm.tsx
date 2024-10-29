import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Cube03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
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
      d="M2.333 5.333h8.334m0 0v8.334m0-8.334 3-3M14 10.225V2.533c0-.186 0-.28-.036-.351a.33.33 0 0 0-.146-.146C13.747 2 13.653 2 13.467 2H5.775c-.163 0-.244 0-.321.018a.7.7 0 0 0-.193.08c-.067.041-.125.1-.24.214L2.312 5.021a1.4 1.4 0 0 0-.214.24.7.7 0 0 0-.08.193C2 5.53 2 5.612 2 5.775v7.692c0 .186 0 .28.036.351a.33.33 0 0 0 .146.146c.071.036.165.036.351.036h7.692c.163 0 .244 0 .321-.018a.7.7 0 0 0 .193-.08c.067-.041.125-.1.24-.214l2.709-2.709c.115-.115.172-.173.214-.24a.7.7 0 0 0 .08-.193c.018-.077.018-.158.018-.321"
    />
  </svg>
)
const ForwardRef = forwardRef(Cube03Sm)
export default ForwardRef
