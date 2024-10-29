import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const PlaySm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
      d="M3.334 3.327c0-.648 0-.971.135-1.15a.67.67 0 0 1 .492-.263c.223-.014.493.166 1.031.525l7.01 4.674c.446.296.668.445.746.632a.67.67 0 0 1 0 .51c-.078.188-.3.336-.745.633l-7.01 4.673c-.54.36-.809.54-1.032.526a.67.67 0 0 1-.492-.264c-.135-.178-.135-.502-.135-1.15z"
    />
  </svg>
)
const ForwardRef = forwardRef(PlaySm)
export default ForwardRef
