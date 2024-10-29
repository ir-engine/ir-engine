import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PaletteSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} clipPath="url(#prefix__a)">
      <path d="M2.334 8a6.667 6.667 0 0 0 6.667 6.666 2 2 0 0 0 2-2v-.333c0-.31 0-.464.017-.594a2 2 0 0 1 1.722-1.722c.13-.017.284-.017.594-.017h.333a2 2 0 0 0 2-2A6.667 6.667 0 0 0 2.334 8" />
      <path d="M5.667 8.666a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333M11.667 6a.667.667 0 1 0 0-1.334.667.667 0 0 0 0 1.334M7.667 5.333a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PaletteSm)
export default ForwardRef
