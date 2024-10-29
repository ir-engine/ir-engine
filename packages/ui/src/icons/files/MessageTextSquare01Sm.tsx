import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MessageTextSquare01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M4.667 5.667H8M4.667 8H10m-3.544 4H10.8c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C14 10.48 14 9.92 14 8.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C12.48 2 11.92 2 10.8 2H5.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C2 3.52 2 4.08 2 5.2v8.357c0 .355 0 .533.073.624.063.08.16.126.26.126.117 0 .256-.112.533-.334l1.59-1.272c.326-.26.488-.39.669-.482q.241-.123.508-.178C5.832 12 6.04 12 6.456 12"
    />
  </svg>
)
const ForwardRef = forwardRef(MessageTextSquare01Sm)
export default ForwardRef
