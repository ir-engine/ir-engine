import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ShoppingBag03Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M13.332 6.805a3.333 3.333 0 0 1-6.666 0m-3.64-.499-.583 7c-.125 1.504-.188 2.256.066 2.836.224.51.61.93 1.1 1.195.557.302 1.311.302 2.82.302h7.14c1.508 0 2.263 0 2.82-.302a2.5 2.5 0 0 0 1.1-1.195c.253-.58.19-1.332.066-2.835l-.584-7c-.108-1.294-.162-1.941-.448-2.431a2.5 2.5 0 0 0-1.079-.992c-.512-.245-1.16-.245-2.459-.245H7.013c-1.299 0-1.948 0-2.46.245a2.5 2.5 0 0 0-1.078.992c-.287.49-.34 1.137-.448 2.43"
    />
  </svg>
)
const ForwardRef = forwardRef(ShoppingBag03Md)
export default ForwardRef
