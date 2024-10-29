import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Cursor03Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3.14 2.45c-.36-.142-.54-.213-.655-.175a.33.33 0 0 0-.211.211c-.038.115.033.295.175.655l3.533 8.97c.115.29.172.436.265.494.081.051.18.064.272.037.106-.031.2-.156.386-.406l1.427-1.903 2.3 3.162c.126.174.19.261.27.297.07.032.15.039.225.018.085-.023.161-.1.313-.251l2.118-2.118c.152-.152.228-.228.251-.313a.33.33 0 0 0-.018-.225c-.036-.08-.123-.144-.297-.27l-3.162-2.3 1.903-1.427c.25-.187.375-.28.406-.386a.33.33 0 0 0-.037-.272c-.058-.093-.203-.15-.493-.265z"
    />
  </svg>
)
const ForwardRef = forwardRef(Cursor03Sm)
export default ForwardRef
