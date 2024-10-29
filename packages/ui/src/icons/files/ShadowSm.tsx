import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const ShadowSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.667 8H8.001m6.666 0a6.64 6.64 0 0 0-.892-3.334M14.667 8a6.64 6.64 0 0 1-.892 3.333m-5.774 3.333A6.667 6.667 0 1 1 8 1.333m0 13.333v-3.333m0 3.333a6.66 6.66 0 0 0 5.774-3.333m-5.774-10v3.333m0-3.333a6.66 6.66 0 0 1 5.774 3.333M8.001 8V4.666M8 8v3.333m0-6.667h5.774m-5.774 6.667h5.774"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(ShadowSm)
export default ForwardRef
