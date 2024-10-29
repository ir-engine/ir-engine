import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const Appliances = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M2 14.666h6M7.333 4.168Q7.973 4 8.667 4a5.333 5.333 0 0 1 2 10.279m-7-5.613h2.666c.31 0 .465 0 .594.026.529.105.942.519 1.047 1.048.026.128.026.283.026.593s0 .465-.026.594a1.33 1.33 0 0 1-1.047 1.047C6.798 12 6.643 12 6.333 12H3.667c-.31 0-.465 0-.594-.026a1.33 1.33 0 0 1-1.047-1.047C2 10.797 2 10.643 2 10.333s0-.465.026-.593a1.33 1.33 0 0 1 1.047-1.048c.129-.026.284-.026.594-.026m-1-5v5h4.666v-5a2.333 2.333 0 0 0-4.666 0"
    />
  </svg>
)
const ForwardRef = forwardRef(Appliances)
export default ForwardRef
