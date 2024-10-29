import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PlayCircleMd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} clipPath="url(#prefix__a)">
      <path d="M10 18.334a8.333 8.333 0 1 0 0-16.667 8.333 8.333 0 0 0 0 16.667" />
      <path d="M7.916 7.471c0-.397 0-.596.083-.707a.42.42 0 0 1 .304-.166c.138-.01.306.098.64.313l3.934 2.529c.29.186.435.28.486.398a.42.42 0 0 1 0 .325c-.05.118-.196.211-.486.398L8.943 13.09c-.334.215-.502.323-.64.313a.42.42 0 0 1-.304-.166c-.083-.111-.083-.31-.083-.708z" />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(PlayCircleMd)
export default ForwardRef
