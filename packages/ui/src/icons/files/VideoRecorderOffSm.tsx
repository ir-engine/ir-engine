import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const VideoRecorderOffSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
        d="M3.334 3.333a2 2 0 0 0-2 2v5.333a2 2 0 0 0 2 2h6a2 2 0 0 0 1.914-1.417M11.334 8l2.423-2.422c.285-.286.428-.429.55-.438a.33.33 0 0 1 .28.116c.08.093.08.295.08.699v4.091c0 .404 0 .606-.08.7a.33.33 0 0 1-.28.116c-.122-.01-.265-.153-.55-.438zm0 0V6.534c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874c-.428-.218-.988-.218-2.108-.218h-1.8m-5-2 13.333 13.333"
      />
    </g>
    <defs>
      <clipPath id="prefix__a">
        <path fill="#fff" d="M0 0h16v16H0z" />
      </clipPath>
    </defs>
  </svg>
)
const ForwardRef = forwardRef(VideoRecorderOffSm)
export default ForwardRef
