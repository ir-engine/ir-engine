import type { SVGProps } from 'react'
import * as React from 'react'
import { Ref, forwardRef } from 'react'
const FastForwardSm = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
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
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="M8.667 10.958c0 .753 0 1.13.152 1.315.133.16.332.25.54.242.239-.01.52-.26 1.084-.76l3.327-2.958c.31-.276.466-.414.523-.576a.67.67 0 0 0 0-.442c-.057-.163-.212-.3-.523-.576l-3.327-2.958c-.563-.501-.845-.751-1.084-.76a.67.67 0 0 0-.54.242c-.152.185-.152.561-.152 1.315zM1.334 10.958c0 .753 0 1.13.152 1.315.132.16.332.25.54.242.239-.01.52-.26 1.083-.76l3.328-2.958c.31-.276.465-.414.523-.576a.67.67 0 0 0 0-.442c-.058-.163-.213-.3-.523-.576L3.11 4.245c-.563-.501-.844-.751-1.083-.76a.67.67 0 0 0-.54.242c-.152.185-.152.561-.152 1.315z" />
    </g>
  </svg>
)
const ForwardRef = forwardRef(FastForwardSm)
export default ForwardRef
