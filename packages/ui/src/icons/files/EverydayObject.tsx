import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const EverydayObject = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g clipPath="url(#prefix__a)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.667 12.933c0 .957.746 1.733 1.666 1.733S8 13.89 8 12.933v-5.6m0 0C6.926 7.333 5.333 8 5.333 8s-.926-.667-2-.667-2 .667-2 .667a6.667 6.667 0 0 1 13.334 0s-.927-.667-2-.667c-1.074 0-2 .667-2 .667S9.073 7.333 8 7.333"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(EverydayObject)
export default ForwardRef
