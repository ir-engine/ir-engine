import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PenTool01Sm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="m13 8.666-.866-4.332c-.048-.242-.072-.363-.131-.461a.7.7 0 0 0-.209-.217c-.096-.063-.216-.092-.455-.15L2.334 1.334m0 0 2.174 9.005c.057.24.086.36.149.456q.084.129.217.208c.098.059.22.083.461.131L9.667 12M2.334 1.333 7.391 6.39m4.364 7.522 3.158-3.158c.264-.264.396-.396.445-.548a.67.67 0 0 0 0-.412c-.049-.153-.18-.285-.445-.549l-.491-.491c-.264-.264-.397-.396-.549-.446a.67.67 0 0 0-.412 0c-.152.05-.284.182-.548.446l-3.158 3.158c-.264.264-.396.396-.446.548a.67.67 0 0 0 0 .412c.05.153.182.285.446.549l.491.491c.264.264.396.396.549.446a.67.67 0 0 0 .412 0c.152-.05.284-.182.548-.446M9.667 7.333a1.333 1.333 0 1 1-2.666 0 1.333 1.333 0 0 1 2.666 0"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PenTool01Sm)
export default ForwardRef
