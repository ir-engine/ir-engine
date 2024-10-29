import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const MusicNote01Md = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M7.5 15V5.296c0-.4 0-.601.073-.764a.83.83 0 0 1 .299-.353c.148-.099.346-.132.742-.198l7.333-1.222c.535-.089.802-.133 1.01-.056a.83.83 0 0 1 .433.366c.11.193.11.464.11 1.005v9.26M7.5 15a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0m10-1.666a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
    />
  </svg>
)
const ForwardRef = forwardRef(MusicNote01Md)
export default ForwardRef
